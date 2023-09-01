terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.51.0"
    }
  }
}

variable "project_id" {
  type    = string
  default = "cali-mobility"
}

variable "region" {
  type    = string
  default = "us-east1"
}

variable "service_region" {
  type =  string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-east1-c"
}


provider "google" {
  credentials = file("cali-mobility-master-key.json")
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

resource "google_artifact_registry_repository" "artifactory_repository" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-third-parties"
  format        = "DOCKER"
  description   = "cali-mobility-third-party repository "
}

resource "google_cloud_run_service" "default" {
  name     = "third-parties"
  location = var.service_region


  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "1"
      }
    }
    spec {
      containers {
        image = "us-east1-docker.pkg.dev/cali-mobility/cali-mobility-notifications/notifications:latest"
        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent = 100
    latest_revision = true
  }
}

// cloud run configuration
/*
module "cloud_run" {
  source  = "GoogleCloudPlatform/cloud-run/google"
  version = "~> 0.2.0"
  # Required variables
  service_name           = ""
  project_id             = var.project_id
  location               = var.service_region
  image                  = ""
  service_account_email = "85094745134-compute@developer.gserviceaccount.com"
  ports = {
    "name": "open port",
    "port": 3000
  }
  env_vars = [
    {
      "value": "cali-mobility-data",
      "name": "BUCKET"
    }
  ]
  template_annotations = {
    "autoscaling.knative.dev/maxScale": 2,
    "autoscaling.knative.dev/minScale": 0,
  }
}
*/