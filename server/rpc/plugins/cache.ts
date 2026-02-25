import { StandardHandlerPlugin, StandardHandlerOptions } from "@orpc/server/standard";

export class CachePlugin<T extends {}> implements StandardHandlerPlugin<T> {
  init(options: StandardHandlerOptions<T>): void {
    options.rootInterceptors ??= [];

    options.rootInterceptors.push(async (interceptorOptions) => {
      const result = await interceptorOptions.next(interceptorOptions);

      if (!result.matched) {
        return result;
      }

      // procedure['~orpc'].meta.cache

      return {
        ...result,
        response: {
          ...result.response,
          headers: {
            ...result.response.headers,
            // etag: etag,
          },
        },
      };
    });
  }
}