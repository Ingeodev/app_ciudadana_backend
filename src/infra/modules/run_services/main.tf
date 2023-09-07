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
