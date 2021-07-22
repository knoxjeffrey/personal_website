namespace :db do
  password = ENV["SUPABASE_PROD_DB_PASSWORD"]
  host = ENV["SUPABASE_PROD_HOST"]

  # rake db:dump_production_data
  desc 'Dump supabase production db to development'
  task :dump_production_data do
    puts "PG_DUMP supabase production db..."
    system "docker exec -i supabase-db bash -c 'PGPASSWORD=\"#{password}\" pg_dump -n public -h db.#{host}.supabase.co -U postgres -Fc > supabase.dump'"
    puts "PG_DUMP complete"

    puts "Replicating production data in development..."
    system "docker exec -i supabase-db bash -c 'pg_restore --verbose --clean -h localhost -U postgres -d postgres < supabase.dump'"
    puts "Done!"
  end

  # rake db:dump_production_schema
  desc 'Dump supabase production db schema to development'
  task :dump_production_schema do
    puts "PG_DUMP supabase production db schema..."
    system "docker exec -i supabase-db bash -c 'PGPASSWORD=\"#{password}\" pg_dump -h db.#{host}.supabase.co -U postgres --clean --schema-only > supabase_schema.sql'"
    puts "PG_DUMP complete"

    puts "Replicating production schema in development..."
    system "docker exec -it supabase-db bash -c 'psql -h localhost -U postgres < supabase_schema.sql'"
    puts "Done!"
  end

  namespace :warning do
    # rake db:warning:dump_development_data_to_production
    desc 'Dump supabase development db to production'
    task :dump_development_data_to_production do
      puts "PG_DUMP supabase development db..."
      system "docker exec -i supabase-db bash -c 'pg_dump -n public -h localhost -U postgres -Fc > supabase_dev.dump'"
      puts "PG_DUMP complete"

      puts "Replicating development data in production..."
      system "docker exec -i supabase-db bash -c 'PGPASSWORD=\"#{password}\" pg_restore --verbose --clean -h db.#{host}.supabase.co -U postgres -d postgres < supabase_dev.dump'"
      puts "Done!"
    end

    # rake db:warning:dump_development_schema_to_production
    desc 'Dump supabase development db schema to production'
    task :dump_development_schema_to_production do
      puts "PG_DUMP supabase development db schema..."
      system "docker exec -i supabase-db bash -c 'pg_dump -h localhost -U postgres --clean --schema-only > supabase_dev_schema.sql'"
      puts "PG_DUMP complete"

      puts "Replicating development schema in production..."
      system "docker exec -it supabase-db bash -c 'PGPASSWORD=\"#{password}\" psql -h db.#{host}.supabase.co -U postgres < supabase_dev_schema.sql'"
      puts "Done!"
    end
  end
end
