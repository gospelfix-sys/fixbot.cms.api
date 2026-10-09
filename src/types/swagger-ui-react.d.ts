declare module 'swagger-ui-react' {
  import { FC } from 'react';

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: 'list' | 'full' | 'none';
    persistAuthorization?: boolean;
    tryItOutEnabled?: boolean;
    defaultModelsExpandDepth?: number;
    displayRequestDuration?: boolean;
    filter?: boolean | string;
    [key: string]: unknown;
  }

  const SwaggerUI: FC<SwaggerUIProps>;
  export default SwaggerUI;
}
