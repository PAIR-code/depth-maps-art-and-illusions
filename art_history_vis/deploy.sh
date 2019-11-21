
#!/bin/bash

#!/usr/bin/env bash
# Copyright 2018 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =============================================================================

# This script deploys the demo to GCP.
# Add --upload_jsons to copy the json files as well.


echo "Building..."
yarn
yarn build

echo "Deploying..."
gsutil mkdir -p gs://art_history_depth_data/demo
gsutil -m cp static/* gs://art_history_depth_data/demo

echo "Setting cache control to private..."
gsutil -m setmeta -h "Cache-Control:private" "gs://art_history_depth_data/**.html"
gsutil -m setmeta -h "Cache-Control:private" "gs://art_history_depth_data/**.css"
gsutil -m setmeta -h "Cache-Control:private" "gs://art_history_depth_data/**.js"

