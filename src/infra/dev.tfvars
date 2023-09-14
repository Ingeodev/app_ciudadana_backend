// Select the dev environment: terraform workspace select dev
// Run a plan to see the changes: terraform plan -var-file=dev.tfvars
// Apply the changes: terraform apply
project_id = "cali-mobility-automated"
image_url = "us-docker.pkg.dev/cloudrun/container/hello"
bucket_name = "cali-mobility-automated-data"
sa_key = "dev_sa.json"