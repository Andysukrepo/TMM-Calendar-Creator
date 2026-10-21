/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYHIP_PRODUCT_SECRET_KEY?: string;
  readonly VITE_PAYHIP_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
