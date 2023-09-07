// Service: Third Parties
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
        value = var.bucket_name
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
// Service: Users
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
        value = var.bucket_name
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

// Service: Admin
resource "google_cloud_run_v2_service" "admin" {
  name     = "admin"
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
        value = var.bucket_name
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

// Service: File Management
resource "google_cloud_run_v2_service" "file_management" {
  name     = "file-management"
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
        name  = "BUCKET"
        value = var.bucket_name
      }
      env {
        name  = "FCM_TOPIC_NAME_MOBILE"
        value = "mobileUsersNotifications"
      }
      env {
        name  = "TWILIO_ACCOUNT_SID"
        value = "ACyourtwilioaccountsid"
      }
      env {
        name  = "TWILIO_AUTH_TOKEN"
        value = "yourtwilioauthenticationtoken"
      }
      env {
        name  = "TWILIO_MESSAGE_SERVICE_SID"
        value = "yourtwilioMessageServiceSID"
      }
    }
  }
}

// Service: notifications
resource "google_cloud_run_v2_service" "notifications" {
  name     = "notifications"
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
        name  = "BUCKET"
        value = var.bucket_name
      }
      env {
        name  = "FCM_TOPIC_NAME_MOBILE"
        value = "mobileUsersNotifications"
      }
      env {
        name  = "TWILIO_ACCOUNT_SID"
        value = "ACyourtwilioaccountsid"
      }
      env {
        name  = "TWILIO_AUTH_TOKEN"
        value = "yourtwilioauthenticationtoken"
      }
      env {
        name  = "TWILIO_MESSAGE_SERVICE_SID"
        value = "yourtwilioMessageServiceSID"
      }
    }
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

resource "google_cloud_run_service_iam_policy" "noauth-admin" {
  location    = google_cloud_run_v2_service.admin.location
  project     = google_cloud_run_v2_service.admin.project
  service     = google_cloud_run_v2_service.admin.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth-file-management" {
  location    = google_cloud_run_v2_service.file_management.location
  project     = google_cloud_run_v2_service.file_management.project
  service     = google_cloud_run_v2_service.file_management.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth-notifications" {
  location    = google_cloud_run_v2_service.notifications.location
  project     = google_cloud_run_v2_service.notifications.project
  service     = google_cloud_run_v2_service.notifications.name
  policy_data = data.google_iam_policy.noauth.policy_data
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