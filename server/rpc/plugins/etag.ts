import { StandardHandlerPlugin, StandardHandlerOptions } from "@orpc/server/standard";
import { createHash } from "crypto";

export class ETagPlugin<T extends {}> implements StandardHandlerPlugin<T> {
  init(options: StandardHandlerOptions<T>): void {
    options.rootInterceptors ??= [];

    options.rootInterceptors.push(async (interceptorOptions) => {
      const result = await interceptorOptions.next(interceptorOptions);

      if (!result.matched) {
        return result;
      }

      // Generate ETag from response body
      const bodyString = JSON.stringify(result.response.body);
      const etag = createHash("md5").update(bodyString).digest("hex");

      // Check if client's ETag matches
      const ifNoneMatch = interceptorOptions.request.headers["if-none-match"];

      if (ifNoneMatch === etag) {
        // Return 304 Not Modified with empty body
        result.response.status = 304;
        /* return {
          ...result,
          response: {
            ...result.response,
            status: 304,
            headers: {
              ...result.response.headers,
              etag: etag,
            },
            body: result.response.body
          },
        }; */
      }

      // Fresh response - set ETag header
      return {
        ...result,
        response: {
          ...result.response,
          headers: {
            ...result.response.headers,
            etag: etag,
          },
        },
      };
    });
  }
}