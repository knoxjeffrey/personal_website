namespace :netlify_build do
  desc "Run build commands on Netlify"

  require "./lib/netlify/netlify_headers_builder.rb"

  BUILD_ENVS = "RACK_ENV=production NO_CONTRACTS=true RUBYOPT='-W0' PARALLEL_PROCESSOR_COUNT=2".freeze
  PRODUCTION_ENVS = "BUILD_TYPE=production".freeze
  BRANCH_ENVS = "BUILD_TYPE=branch".freeze

  # Before the build we create a _headers file in the source directory which Netlify automatically uses
  # to generate the header rules for each path
  def build_headers(build_context)
    Netlify::NetlifyHeadersBuilder.build(build_context)
  end

  yarn_test = "yarn test --maxWorkers=2"
  vite_build = "rake vite:clobber && rake vite:build"
  middleman_build = "#{BUILD_ENVS} bundle exec middleman build"

  task :production, [:build_options] do |_task, args|
    build_headers("production")
    sh "#{yarn_test} && #{vite_build} && #{PRODUCTION_ENVS} #{middleman_build} #{args[:build_options]}"
  end

  task :branch, [:build_options] do |_task, args|
    build_headers("branch")
    sh "#{yarn_test} &&  #{vite_build} && #{BRANCH_ENVS} #{middleman_build} #{args[:build_options]}"
  end
end
