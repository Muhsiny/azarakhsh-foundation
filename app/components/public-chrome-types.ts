export type PublicChromeSettings = {
  identity: { siteName: string; logoUrl: string; tagline: string };
  media: { bismillahUrl: string };
  colors: { primary: string; dark: string; gold: string; paper: string };
  design: { contentWidth: number };
  footer: { mission: string; copyright: string; mottoKicker: string; mottoTitle: string; mottoText: string };
  contact: { email: string };
  navigation: {
    primary: Array<{ href: string; label: string; enabled: boolean }>;
    more: Array<{ href: string; label: string; enabled: boolean }>;
    footer: Array<{ href: string; label: string; enabled: boolean }>;
  };
};
