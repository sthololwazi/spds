export interface StandardsPack {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export const sampleStandards: StandardsPack = {
  id: 'spds-standards-sample',
  name: 'Sample Standards Pack',
  version: '0.1.0',
  description: 'A placeholder standards pack for SPDS'
};

export default sampleStandards;
