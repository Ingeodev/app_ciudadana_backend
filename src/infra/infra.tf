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
  default = "us-central1"
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
  credentials = file("cali-mobility-automated-sa.json")
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

resource "google_artifact_registry_repository" "artifactory_repository_third_parties" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-third-parties"
  format        = "DOCKER"
  description   = "cali-mobility-third-party repository "
}

resource "google_artifact_registry_repository" "artifactory_repository_users" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-users"
  format        = "DOCKER"
  description   = "cali-mobility-users repository "
}

resource "google_artifact_registry_repository" "artifactory_repository_admin" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-admin"
  format        = "DOCKER"
  description   = "cali-mobility-admin repository "
}

resource "google_artifact_registry_repository" "artifactory_repository_file_management" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-file-management"
  format        = "DOCKER"
  description   = "cali-mobility-file-management repository "
}

resource "google_artifact_registry_repository" "artifactory_repository_frontend" {
  project      = var.project_id
  location      = var.region
  repository_id = "cali-mobility-frontend"
  format        = "DOCKER"
  description   = "cali-mobility-frontend repository "
}

resource "google_storage_bucket" "mobility-data" {
  name          = var.bucket_name
  location      = "US"
  force_destroy = true
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

resource "google_cloud_run_v2_service" "third-parties" {
  name     = "third-parties"
  location = var.service_region
  template {
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
    containers {
      image = var.image_url
      ports {
        container_port = 3000
      }
      env {
        name = "BUCKET"
        value = google_storage_bucket.mobility-data.name
      }
      env {
        name = "FCM_TOPIC_NAME_MOBILE"
        value = "mobileUsersNotifications"
      }
      env {
        name = "TWILIO_ACCOUNT_SID"
        value = "ACyourtwilioaccountsid"
      }
      env {
        name = "TWILIO_AUTH_TOKEN"
        value = "yourtwilioauthenticationtoken"
      }
      env {
        name = "TWILIO_MESSAGE_SERVICE_SID"
        value = "yourtwilioMessageServiceSID"
      }
    }
  }
  traffic {
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "users" {
  name     = "users"
  location = var.service_region
  template {
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
    containers {
      image = var.image_url
      ports {
        container_port = 3000
      }
      env {
        name = "BUCKET"
        value = google_storage_bucket.mobility-data.name
      }
      env {
        name = "FCM_TOPIC_NAME_MOBILE"
        value = "mobileUsersNotifications"
      }
      env {
        name = "TWILIO_ACCOUNT_SID"
        value = "ACyourtwilioaccountsid"
      }
      env {
        name = "TWILIO_AUTH_TOKEN"
        value = "yourtwilioauthenticationtoken"
      }
      env {
        name = "TWILIO_MESSAGE_SERVICE_SID"
        value = "yourtwilioMessageServiceSID"
      }
    }
  }

  traffic {
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth-users" {
  location    = google_cloud_run_v2_service.users.location
  project     = google_cloud_run_v2_service.users.project
  service     = google_cloud_run_v2_service.users.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth-third-parties" {
  location    = google_cloud_run_v2_service.third-parties.location
  project     = google_cloud_run_v2_service.third-parties.project
  service     = google_cloud_run_v2_service.third-parties.name
  policy_data = data.google_iam_policy.noauth.policy_data
}
