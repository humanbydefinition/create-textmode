type FxFeatureValue = string | number | boolean;
type FxFeatures = Record<string, FxFeatureValue>;

interface FxRandFn {
  (): number;
  reset(): void;
}

type FxParamType = 'number' | 'bigint' | 'boolean' | 'color' | 'string' | 'bytes' | 'select';

type FxParamUpdate = 'page-reload' | 'sync' | 'code-driven';

type FxParamDefinition = {
  id: string;
  name?: string;
  type: FxParamType;
  options?: Record<string, unknown>;
  default?: unknown;
  update?: FxParamUpdate;
  version?: string;
};

type FxParamDefinitions = FxParamDefinition[];
type FxParamsObject = Record<string, unknown>;
type FxParamEventId = 'params:update' | string;

interface FxApi {
  hash: string;
  minter: string;
  iteration: number;
  context: 'standalone' | 'capture' | 'minting' | string;
  isPreview: boolean;
  lineage?: string[];
  depth?: number;
  rand: FxRandFn;
  randminter: FxRandFn;
  randAt?: (depth: number) => number;
  features: (features: FxFeatures) => void;
  getFeature: (name: string) => FxFeatureValue | undefined;
  getFeatures: () => FxFeatures;
  preview: () => void;
  params: (definitions: FxParamDefinitions) => void;
  getParam: (id: string) => unknown;
  getParams: () => FxParamsObject;
  getRawParam: (id: string) => string | undefined;
  emit: (eventId: FxParamEventId, data?: FxParamsObject) => void;
  on: (
    eventId: FxParamEventId,
    handler: (...args: any[]) => boolean | Promise<boolean>,
    onDone?: (optInDefault: boolean, ...args: any[]) => void
  ) => () => void;
}

declare const $fx: FxApi;
