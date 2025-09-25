import { component$ } from '@builder.io/qwik';

export const HeartIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
));

export const BrainIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.5 2C8.12 2 7 3.12 7 4.5S8.12 7 9.5 7 12 5.88 12 4.5 10.88 2 9.5 2M14.5 2C13.12 2 12 3.12 12 4.5S13.12 7 14.5 7 17 5.88 17 4.5 15.88 2 14.5 2M9.5 8C7.01 8 5 10.01 5 12.5S7.01 17 9.5 17 14 14.99 14 12.5 11.99 8 9.5 8M14.5 8C12.01 8 10 10.01 10 12.5S12.01 17 14.5 17 19 14.99 19 12.5 16.99 8 14.5 8M9.5 18C6.79 18 4.5 20.29 4.5 23S6.79 28 9.5 28 14.5 25.71 14.5 23 12.21 18 9.5 18M14.5 18C11.79 18 9.5 20.29 9.5 23S11.79 28 14.5 28 19.5 25.71 19.5 23 17.21 18 14.5 18Z"/>
  </svg>
));

export const ShieldIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16.2V16H7.8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
  </svg>
));

export const BellIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A1,1 0 0,1 13,3V4.29C15.89,4.85 18,7.5 18,10.5V16L20,18V19H4V18L6,16V10.5C6,7.5 8.11,4.85 11,4.29V3A1,1 0 0,1 12,2M12,6A3,3 0 0,0 9,9V16H15V9A3,3 0 0,0 12,6M10,20H14A2,2 0 0,1 12,22A2,2 0 0,1 10,20Z"/>
  </svg>
));

export const SmartphoneIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
  </svg>
));

export const LogOutIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
  </svg>
));

export const SettingsIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
  </svg>
));

export const ZapIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7,2V13H10V22L17,10H13L17,2H7Z"/>
  </svg>
));

export const UsersIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 13C18.67 13 24 14.33 24 17V20H8V17C8 14.33 13.33 13 16 13M8 12C10.2 12 12 10.2 12 8S10.2 4 8 4 4 5.8 4 8 5.8 12 8 12M8 13C5.33 13 0 14.33 0 17V20H6V17C6 15.9 6.4 14.9 7.1 14.1C5.5 13.4 6.6 13 8 13M16 14C15.3 14 14.6 14.1 13.9 14.3C15.2 15.1 16 16.3 16 17.7V20H24V17C24 14.33 18.67 14 16 14Z"/>
  </svg>
));

export const Building2Icon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,3L2,12H5V20H19V12H22L12,3M12,8.5A1.5,1.5 0 0,1 13.5,10A1.5,1.5 0 0,1 12,11.5A1.5,1.5 0 0,1 10.5,10A1.5,1.5 0 0,1 12,8.5M7.5,18V14H9.5V18H7.5M11.5,18V14H13.5V18H11.5M15.5,18V14H17.5V18H15.5Z"/>
  </svg>
));

export const ActivityIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22,12H20V8H16V6H14V8H10V6H8V8H4V12H2V14H4V18H8V20H10V18H14V20H16V18H20V14H22V12M10,16H8V14H10V16M14,16H12V14H14V16M18,16H16V14H18V16M10,12H8V10H10V12M14,12H12V10H14V12M18,12H16V10H18V12Z"/>
  </svg>
));

export const TrendingUpIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
  </svg>
));

export const AlertCircleIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
  </svg>
));

export const BarChart3Icon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3,13H5V21H3V13M7,9H9V21H7V9M11,17H13V21H11V17M15,5H17V21H15V5M19,11H21V21H19V11Z"/>
  </svg>
));

export const UserPlusIcon = component$<{ class?: string }>(({ class: className }) => (
  <svg class={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15,12C17.21,12 19,10.21 19,8C19,5.79 17.21,4 15,4C12.79,4 11,5.79 11,8C11,10.21 12.79,12 15,12M15,14C12.33,14 7,15.34 7,18V20H23V18C23,15.34 17.67,14 15,14M8,12C10.21,12 12,10.21 12,8C12,5.79 10.21,4 8,4C5.79,4 4,5.79 4,8C4,10.21 5.79,12 8,12M8,14C5.33,14 0,15.34 0,18V20H6V18C6,16.9 6.4,15.9 7.1,15.1C5.5,14.4 6.6,14 8,14Z"/>
  </svg>
));
