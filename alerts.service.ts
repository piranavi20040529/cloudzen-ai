import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { DisasterAlert } from './entities/disaster-alert.entity.js';

// Sri Lanka bounding box
const SL_LAT_MIN = 5.9;
const SL_LAT_MAX = 9.9;
const SL_LON_MIN = 79.5;
const SL_LON_MAX = 81.9;
const SL_RADIUS_KM = 500;

// Sri Lanka emergency contacts
const SL_EMERGENCY_CONTACTS = [
  { name: 'Disaster Management Centre (DMC)', phone: '117' },
  { name: 'Police Emergency', phone: '119' },
  { name: 'Ambulance Rescue Service', phone: '1990' },
];

const DISASTER_TYPE_ICONS: Record<string, string> = {
  flood: 'water-alert',
  earthquake: 'image-broken-variant',
  cyclone: 'weather-hurricane',
  tsunami: 'wave',
  storm: 'weather-lightning-rainy',
  volcano: 'fire',
  drought: 'weather-sunny-alert',
  default: 'alert-circle',
};

const SAFETY_BRIEFS: Record<string, string[]> = {
  flood: [
    'Avoid driving through flooded roads and underpasses.',
    'Keep emergency contacts (117) saved on speed dial.',
    'Store valuable documents in waterproof bags.',
    'Move to higher ground if water levels are rising.',
  ],
  earthquake: [
    'Drop, Cover, and Hold On during shaking.',
    'Stay away from windows and heavy furniture.',
    'After shaking stops, check for injuries and structural damage.',
    'Be prepared for aftershocks.',
  ],
  cyclone: [
    'Stay indoors and away from windows.',
    'Secure loose outdoor objects.',
    'Stock up on water, food, and essential supplies.',
    'Follow official evacuation orders immediately.',
  ],
  tsunami: [
    'Move immediately to higher ground or inland.',
    'Do not return to the coast until given the all-clear.',
    'Stay away from beaches and low-lying coastal areas.',
    'Listen to official warnings via radio or TV.',
  ],
  storm: [
    'Avoid using electrical appliances during lightning.',
    'Stay indoors and away from windows.',
    'Do not shelter under isolated trees.',
    'Keep emergency supplies ready.',
  ],
  default: [
    'Stay informed via official channels (DMC, MetDept).',
    'Keep emergency kit ready with water and first aid.',
    'Follow local authority instructions.',
  ],
};

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(DisasterAlert)
    private alertsRepository: Repository<DisasterAlert>,
  ) { }

  async getAlerts(lat?: number, lon?: number) {
    const alerts = await this.alertsRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Format response to match mockDisasterAlerts shape
    return alerts.map((alert) => {
      const timeDiff = Date.now() - new Date(alert.createdAt).getTime();
      const timeAgo = this.formatTimeAgo(timeDiff);

      let distance = '';
      if (lat && lon && alert.latitude && alert.longitude) {
        const dist = this.calculateDistance(
          lat,
          lon,
          Number(alert.latitude),
          Number(alert.longitude),
        );
        distance = `${Math.round(dist)} km away`;
      }

      return {
        id: alert.id,
        title: alert.title,
        type: alert.type,
        typeIcon: alert.typeIcon,
        severity: alert.severity,
        severityLabel: alert.severityLabel,
        source: alert.source,
        time: timeAgo,
        affectedArea: alert.affectedArea,
        distance,
        description: alert.description,
        safetyBrief: alert.safetyBrief,
        emergencyContacts:
          alert.emergencyContacts?.length > 0
            ? alert.emergencyContacts
            : SL_EMERGENCY_CONTACTS,
      };
    });
  }

  // Poll GDACS and USGS every 10 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async pollDisasterSources() {
    this.logger.log('Polling disaster alert sources...');
    await Promise.all([this.pollGDACS(), this.pollUSGS()]);
  }

  private async pollGDACS() {
    try {
      const { data } = await axios.get(
        'https://www.gdacs.org/xml/rss.xml',
        { timeout: 15000 },
      );

      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(data);
      const items = result?.rss?.channel?.item;

      if (!items) return;

      const itemsArray = Array.isArray(items) ? items : [items];

      for (const item of itemsArray) {
        // Filter for events near Sri Lanka
        const geoLat = parseFloat(
          item['geo:lat'] || item['gdacs:lat'] || '0',
        );
        const geoLon = parseFloat(
          item['geo:long'] || item['gdacs:long'] || '0',
        );

        const distToSL = this.calculateDistance(7.8, 80.7, geoLat, geoLon);
        if (distToSL > SL_RADIUS_KM) continue;

        const externalId = `gdacs_${item.guid?._ || item.guid || item.link}`;

        // Check if already exists
        const exists = await this.alertsRepository.findOne({
          where: { externalId },
        });
        if (exists) continue;

        const eventType = this.detectEventType(
          item.title || '',
          item.description || '',
        );
        const severity = this.detectSeverity(
          item['gdacs:alertlevel'] || item.title || '',
        );

        const alert = this.alertsRepository.create({
          title: item.title || 'GDACS Alert',
          type: eventType.charAt(0).toUpperCase() + eventType.slice(1),
          typeIcon: DISASTER_TYPE_ICONS[eventType] || DISASTER_TYPE_ICONS.default,
          severity: severity.level,
          severityLabel: severity.label,
          source: 'GDACS',
          description: this.stripHtml(item.description || ''),
          affectedArea: this.extractArea(item.title || '', geoLat, geoLon),
          latitude: geoLat,
          longitude: geoLon,
          safetyBrief: SAFETY_BRIEFS[eventType] || SAFETY_BRIEFS.default,
          emergencyContacts: SL_EMERGENCY_CONTACTS,
          externalId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        });

        await this.alertsRepository.save(alert);
        this.logger.log(`Saved GDACS alert: ${alert.title}`);
      }
    } catch (error) {
      this.logger.error('GDACS poll failed', error.message);
    }
  }

  private async pollUSGS() {
    try {
      const { data } = await axios.get(
        'https://earthquake.usgs.gov/fdsnws/event/1/query',
        {
          params: {
            format: 'geojson',
            minlatitude: SL_LAT_MIN - 5,
            maxlatitude: SL_LAT_MAX + 5,
            minlongitude: SL_LON_MIN - 5,
            maxlongitude: SL_LON_MAX + 5,
            minmagnitude: 2.5,
            limit: 10,
            orderby: 'time',
          },
          timeout: 15000,
        },
      );

      if (!data?.features) return;

      for (const feature of data.features) {
        const props = feature.properties;
        const coords = feature.geometry?.coordinates;
        if (!coords) continue;

        const [lon, lat, depth] = coords;
        const distToSL = this.calculateDistance(7.8, 80.7, lat, lon);
        if (distToSL > SL_RADIUS_KM) continue;

        const externalId = `usgs_${feature.id}`;

        const exists = await this.alertsRepository.findOne({
          where: { externalId },
        });
        if (exists) continue;

        const mag = props.mag || 0;
        const severity =
          mag >= 6
            ? { level: 'emergency', label: 'EMERGENCY' }
            : mag >= 4.5
              ? { level: 'warning', label: 'WARNING' }
              : mag >= 3
                ? { level: 'watch', label: 'WATCH' }
                : { level: 'advisory', label: 'ADVISORY' };

        const alert = this.alertsRepository.create({
          title: `M${mag.toFixed(1)} Earthquake — ${props.place || 'Near Sri Lanka'}`,
          type: 'Earthquake',
          typeIcon: DISASTER_TYPE_ICONS.earthquake,
          severity: severity.level,
          severityLabel: severity.label,
          source: 'USGS',
          description: `Magnitude ${mag.toFixed(1)} earthquake at depth ${depth?.toFixed(0) || '?'}km. ${props.place || ''}`,
          affectedArea: props.place || 'Indian Ocean Region',
          latitude: lat,
          longitude: lon,
          safetyBrief: SAFETY_BRIEFS.earthquake,
          emergencyContacts: SL_EMERGENCY_CONTACTS,
          externalId,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
        });

        await this.alertsRepository.save(alert);
        this.logger.log(`Saved USGS alert: ${alert.title}`);
      }
    } catch (error) {
      this.logger.error('USGS poll failed', error.message);
    }
  }

  // Helpers
  private detectEventType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('flood')) return 'flood';
    if (text.includes('earthquake') || text.includes('seismic'))
      return 'earthquake';
    if (text.includes('cyclone') || text.includes('typhoon')) return 'cyclone';
    if (text.includes('tsunami')) return 'tsunami';
    if (text.includes('storm') || text.includes('thunder')) return 'storm';
    if (text.includes('volcano')) return 'volcano';
    if (text.includes('drought')) return 'drought';
    return 'default';
  }

  private detectSeverity(alertLevel: string): {
    level: string;
    label: string;
  } {
    const text = alertLevel.toLowerCase();
    if (text.includes('red') || text.includes('emergency'))
      return { level: 'emergency', label: 'EMERGENCY' };
    if (text.includes('orange') || text.includes('warning'))
      return { level: 'warning', label: 'WARNING' };
    if (text.includes('yellow') || text.includes('watch'))
      return { level: 'watch', label: 'WATCH' };
    return { level: 'advisory', label: 'ADVISORY' };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private formatTimeAgo(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim().substring(0, 500);
  }

  private extractArea(
    title: string,
    lat: number,
    lon: number,
  ): string {
    // Try to extract location from title
    const parts = title.split('-').map((p) => p.trim());
    if (parts.length > 1) return parts[parts.length - 1];

    // Fallback: use general area based on coordinates
    if (lat >= SL_LAT_MIN && lat <= SL_LAT_MAX && lon >= SL_LON_MIN && lon <= SL_LON_MAX) {
      return 'Sri Lanka';
    }
    return 'Indian Ocean Region';
  }
}
