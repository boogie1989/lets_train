runner:
	clear && dart run build_runner build --verbose

runner-conflict:
	dart run build_runner build --delete-conflicting-outputs

runner-clean:
	fvm dart run build_runner clean

runner-rebuild:
	make runner-clean && make runner-conflict

locale:
	clear && fvm dart run slang

locale-watch:
	fvm dart run slang watch
	
rebuild:
	fvm flutter clean && make runner-clean && fvm flutter pub get && make runner

format:
	fvm dart format lib -l 80

import-sort:
	fvm dart run import_sorter:main --no-comments lib

fix:
	fvm dart fix --apply && fvm dart format lib

drift_schema:
	dart run drift_dev schema dump lib/database/database.dart drift_schemas/

drift_steps:
	dart run drift_dev schema steps drift_schemas/ lib/database/schema_versions.dart


t:
	clear && flutter test