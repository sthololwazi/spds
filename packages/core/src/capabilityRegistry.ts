export type Capability = string;

export interface CapabilityProvider {
  id: string;
  capabilities: Capability[];
}

export class CapabilityRegistry {
  private providers = new Map<string, CapabilityProvider>();

  register(provider: CapabilityProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  listCapabilities(): Capability[] {
    const set = new Set<Capability>();
    for (const p of this.providers.values()) {
      for (const c of p.capabilities) set.add(c);
    }
    return Array.from(set);
  }

  getProviders(): CapabilityProvider[] {
    return Array.from(this.providers.values());
  }
}

export const globalRegistry = new CapabilityRegistry();
