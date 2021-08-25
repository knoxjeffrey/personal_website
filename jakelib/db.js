require("dotenv").config()

const docker_exec = "docker exec -i supabase-db bash -c"
const {
  SUPABASE_PROD_DB_PASSWORD,
  SUPABASE_PROD_HOST
} = process.env

namespace("db", () => {
  // jake db:dump_production_all
  // desc("Dump supabase production db to development")
  // task("dump_production_all", async () => {
  //   console.log("PG_DUMP supabase production db...")
  //   await new Promise((resolve, _reject) => {
  //     jake.exec(
  //       `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' pg_dump -n public -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres -Fc > supabase.dump"`,
  //       { breakOnError: false },
  //       () => resolve()
  //     )
  //   })
  //   console.log("PG_DUMP complete")

  //   console.log("Replicating production db in development...")
  //   await new Promise((resolve, _reject) => {
  //     jake.exec(
  //       `${docker_exec} 'pg_restore --verbose --clean -h localhost -U postgres -d postgres < supabase.dump'`,
  //       { breakOnError: false },
  //       () => resolve()
  //     )
  //   })
  //   console.log("Done!")
  // })

  // jake db:dump_production_schema
  desc("Dump supabase production db schema to development")
  task("dump_production_schema", async () => {
    console.log("PG_DUMP supabase production db schema...")
    await new Promise((resolve, _reject) => {
      jake.exec(
        `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' pg_dump -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres --clean --schema-only > supabase_schema.sql"`,
        { breakOnError: true },
        () => resolve()
      )
    })
    console.log("PG_DUMP complete")

    console.log("Replicating production schema in development...")
    await new Promise((resolve, _reject) => {
      jake.exec(
        `${docker_exec} "psql -h localhost -U postgres < supabase_schema.sql"`,
        { breakOnError: false },
        () => resolve()
      )
    })
    console.log("Done!")
  })

  // jake db:dump_production_data
  desc("Dump supabase production db data to development")
  task("dump_production_data", async () => {
    console.log("PG_DUMP supabase production db data...")
    await new Promise((resolve, _reject) => {
      jake.exec(
        `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' pg_dump -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres --data-only -n public > supabase_data.sql"`,
        { breakOnError: false },
        () => resolve()
      )
    })
    console.log("PG_DUMP complete")

    console.log("Replicating production data in development...")
    await new Promise((resolve, _reject) => {
      jake.exec(
        `${docker_exec} "psql -h localhost -U postgres < supabase_data.sql"`,
        { breakOnError: false },
        () => resolve()
      )
    })
    console.log("Done!")
  })

  namespace("warning", () => {
    // jake db:warning:dump_development_all_to_production
    // desc("Dump supabase development db to production")
    // task("dump_development_all_to_production", async () => {
    //   console.log("PG_DUMP supabase development db...")
    //   await new Promise((resolve, _reject) => {
    //     jake.exec(
    //       `${docker_exec} "pg_dump -n public -h localhost -U postgres -Fc > supabase_dev.dump"`,
    //       { breakOnError: false },
    //       () => resolve()
    //     )
    //   })
    //   console.log("PG_DUMP complete")

    //   console.log("Replicating development in production...")
    //   await new Promise((resolve, _reject) => {
    //     jake.exec(
    //       `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' pg_restore --verbose --clean -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres -d postgres < supabase_dev.dump"`,
    //       { breakOnError: false },
    //       () => resolve()
    //     )
    //   })
    //   console.log("Done!")
    // })

    // jake db:warning:dump_development_schema_to_production
    desc("Dump supabase development db schema to production")
    task("dump_development_schema_to_production", async () => {
      console.log("PG_DUMP supabase development db schema...")
      await new Promise((resolve, _reject) => {
        jake.exec(
          `${docker_exec} "pg_dump -h localhost -U postgres --clean --schema-only > supabase_dev_schema.sql"`,
          { breakOnError: false },
          () => resolve()
        )
      })
      console.log("PG_DUMP complete")

      console.log("Replicating development schema in production...")
      await new Promise((resolve, _reject) => {
        jake.exec(
          `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' psql -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres < supabase_dev_schema.sql"`,
          { breakOnError: false },
          () => resolve()
        )
      })
      console.log("Done!")
    })

    // jake db:warning:dump_development_data_to_production
    desc("Dump supabase development db data to production")
    task("dump_development_data_to_production", async () => {
      console.log("PG_DUMP supabase development db data...")
      await new Promise((resolve, _reject) => {
        jake.exec(
          `${docker_exec} "pg_dump -h localhost -U postgres --data-only -n public > supabase_dev_data.sql"`,
          { breakOnError: false },
          () => resolve()
        )
      })
      console.log("PG_DUMP complete")

      console.log("Replicating development data in production...")
      await new Promise((resolve, _reject) => {
        jake.exec(
          `${docker_exec} "PGPASSWORD='${SUPABASE_PROD_DB_PASSWORD}' psql -h db.${SUPABASE_PROD_HOST}.supabase.co -U postgres < supabase_dev_data.sql"`,
          { breakOnError: false },
          () => resolve()
        )
      })
      console.log("Done!")
    })
  })
})
