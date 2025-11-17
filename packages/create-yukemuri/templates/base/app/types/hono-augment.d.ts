import type { Env, Schema, MergePath, MergeSchemaPath } from "hono/types"

declare module "hono" {
  interface Hono<E extends Env = Env, S extends Schema = {}, BasePath extends string = "/"> {
    route<
      SubPath extends string,
      SubEnv extends Env,
      SubSchema extends Schema,
      SubBasePath extends string,
    >(
      path: SubPath,
      app: Hono<SubEnv, SubSchema, SubBasePath>
    ): Hono<E, MergeSchemaPath<SubSchema, MergePath<BasePath, SubPath>> | S, BasePath>
  }
}
