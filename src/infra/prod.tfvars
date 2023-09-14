// Select the dev environment: terraform workspace select dev
// Run a plan to see the changes: terraform plan -var-file=dev.tfvars
// Apply the changes: terraform apply
project_id = "aplicacion-ciudadana-cali"
image_url = "us-docker.pkg.dev/cloudrun/container/hello"
bucket_name = "aplicacion-ciudadania-cali-data"
sa_key = "prod_sa.json"
