namespace :netlify_build do
  desc "Run build commands on Netlify"

  BUILD_ENVS = "NO_CONTRACTS=true RUBYOPT='-W0' PARALLEL_PROCESSOR_COUNT=2".freeze

  middleman_build = "#{BUILD_ENVS} bundle exec middleman build"

  task :production, [:build_options] do |_task, args|
    sh "#{middleman_build} #{args[:build_options]}"
  end
end
