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
