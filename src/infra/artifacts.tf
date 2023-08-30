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

variable "zone" {
  type    = string
  default = "us-east1-c"
}


provider "google" {
  credentials = file("cali-mobility-sa.json")
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

resource "google_artifact_registry_repository" "artifactory_repository" {
  project       = var.project_id
  location      = var.region
  repository_id = "cali-mobility-third-parties"
  format        = "DOCKER"
  description   = "cali-mobility-third-party repository "
}