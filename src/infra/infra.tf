// add to the comput and deploy sa
// Cloud Run Admin
// Cloud Run Service Agent
// Owner
// Security Admin
// Service Account User
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.80.0"
    }
  }
}

variable "project_id" {
  type    = string
  default = "cali-mobility-automated"
}

variable "region" {
  type    = string
  default = "us-east1"
}

variable "service_region" {
  type =  string
  default = "us-east1"
}

variable "sa_key" {
  type = string
  default = "dev_sa.json"
}

variable "zone" {
  type    = string
  default = "us-east1-c"
}

variable "image_url" {
  type = string
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "bucket_name" {
  type = string
  default = "cali-mobility-automated-data"
}

provider "google" {
  // credentials = file("cali-mobility-master-key.json")
  credentials = file(var.sa_key)
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

module "artifacts" {
  source = "./modules/artifacts"
  project_id = var.project_id
  region = var.region
}

resource "google_storage_bucket" "mobility-data" {
  name          = var.bucket_name
  location      = "US"
  force_destroy = true
}

module "run_services" {
  source = "./modules/run_services"
  service_region = var.service_region
  bucket_name = var.bucket_name
  image_url = var.image_url
}

/*
resource "google_artifact_registry_repository" "artifactory_repository" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-admin"
  format        = "DOCKER"
  description   = "cali-mobility-admin repository "
}

resource "google_artifact_registry_repository" "artifactory_repository" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-file-management"
  format        = "DOCKER"
  description   = "cali-mobility-file-management repository "
}

resource "google_artifact_registry_repository" "artifactory_repository" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-notifications"
  format        = "DOCKER"
  description   = "cali-mobility-notifications repository "
}


resource "google_artifact_registry_repository" "artifactory_repository" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-frontend"
  format        = "DOCKER"
  description   = "cali-mobility-frontend repository "
}
*/

