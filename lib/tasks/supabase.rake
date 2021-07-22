namespace :db do
  # rake db:pull_schema
  desc 'Pull supabase production db schema to development'
  task :pull_schema do
    password = ENV["SUPABASE_PROD_DB_PASSWORD"]
    host = ENV["SUPABASE_PROD_HOST"]

    puts "PG_DUMP on supabase production db schema..."
    system "docker exec -it supabase-db bash -c 'PGPASSWORD=\"#{password}\" pg_dump -h db.#{host}.supabase.co -U postgres --clean --schema-only > supabase_schema.sql'"
    puts "PG_DUMP complete"

    puts "Updating development schema..."
    system "docker exec -it supabase-db bash -c 'psql -h localhost -U postgres < supabase_schema.sql'"
    puts "Done!"
  end
end
