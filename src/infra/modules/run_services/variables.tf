variable "service_region" {
  type =  string
  default = "us-east1"
}

variable "image_url" {
  type = string
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "bucket_name" {
  type = string
  default = "cali-mobility-automated-data"
}
