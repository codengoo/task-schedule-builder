# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added
- Initial release
- TaskSchedulerBuilder class with fluent API
- Support for time-based, logon, and startup triggers
- XML generation for Windows Task Scheduler format
- CLI integration with schtasks command
- Task management utilities (create, delete, list, run)
- Comprehensive test suite
- Full TypeScript support with type definitions
- Documentation and examples

### Features
- Create scheduled tasks with builder pattern
- Parse task configuration to XML
- Apply tasks using schtasks /Create /XML
- List all scheduled tasks with filtering
- Delete tasks from Windows Task Scheduler
- Run tasks immediately
- Check task existence
- Get detailed task information
- Support for multiple triggers and actions
- Configurable task settings and principal
- Error handling and validation
