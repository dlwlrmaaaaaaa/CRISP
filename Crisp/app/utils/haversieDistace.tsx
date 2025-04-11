// src/utils/distanceUtils.ts

import { LocationObject } from 'expo-location';

export interface Report {
  id: string;
  username: string;
  type_of_report: string;
  report_description: string;
  longitude: number;
  latitude: number;
  category: string;
  image_path: string;
  upvote: number;
  downvote: number;
  report_date: string;
  custom_type: string;
  floor_number: string;
  upvoteCount: number | any;
  downvoteCount: number | any;
  voted: "upvote" | "downvote" | null;
  is_validated: boolean;
}

export const haversineDistance = (
  userLocation: LocationObject['coords'],
  selectedReport: Report
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const lat1 = toRad(userLocation.latitude);
  const lon1 = toRad(userLocation.longitude);
  const lat2 = toRad(selectedReport.latitude);
  const lon2 = toRad(selectedReport.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = 6371000; // Earth's radius in meters
  return radius * c; // Distance in meters
};
