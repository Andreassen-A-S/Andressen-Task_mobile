Pod::Spec.new do |s|
  s.name           = 'NativeMentionComposer'
  s.version        = '0.1.0'
  s.summary        = 'Native mention composer for MesterPlan'
  s.description    = 'Native mention composer for MesterPlan'
  s.author         = 'MesterPlan'
  s.homepage       = 'https://mesterplan.app'
  s.license        = 'UNLICENSED'
  s.platforms      = { ios: '16.4' }
  s.source         = { git: '' }
  s.source_files   = '*.swift'
  s.dependency 'ExpoModulesCore'
end
