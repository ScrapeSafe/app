// Shared storage for API routes
// In production, this should be replaced with a database

export interface SiteRegistration {
  siteId: number;
  domain: string;
  ownerWallet: string;
  verificationToken: string;
  createdAt: Date;
  verified: boolean;
}

class SiteRegistrationStorage {
  private registrations = new Map<number, SiteRegistration>();
  private nextSiteId = 1;

  create(domain: string, ownerWallet: string, verificationToken: string): SiteRegistration {
    const siteId = this.nextSiteId++;
    const registration: SiteRegistration = {
      siteId,
      domain: domain.toLowerCase(),
      ownerWallet: ownerWallet.toLowerCase(),
      verificationToken,
      createdAt: new Date(),
      verified: false
    };
    this.registrations.set(siteId, registration);
    return registration;
  }

  get(siteId: number): SiteRegistration | undefined {
    return this.registrations.get(siteId);
  }

  findByDomain(domain: string): SiteRegistration | undefined {
    const normalizedDomain = domain.toLowerCase();
    for (const registration of this.registrations.values()) {
      if (registration.domain === normalizedDomain) {
        return registration;
      }
    }
    return undefined;
  }

  update(siteId: number, updates: Partial<SiteRegistration>): SiteRegistration | undefined {
    const registration = this.registrations.get(siteId);
    if (!registration) {
      return undefined;
    }
    const updated = { ...registration, ...updates };
    this.registrations.set(siteId, updated);
    return updated;
  }

  getAll(): SiteRegistration[] {
    return Array.from(this.registrations.values());
  }
}

export const siteStorage = new SiteRegistrationStorage();

