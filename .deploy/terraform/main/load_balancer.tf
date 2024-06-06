resource "aws_lb_listener_rule" "blind_test_client_listener_rule" {
  listener_arn = data.terraform_remote_state.central.outputs.https_listener_arn
  priority     = 110

  action {
    type             = "forward"
    target_group_arn = data.terraform_remote_state.central.outputs.blindtest_client_tg_arn
  }

  condition {
    host_header {
      values = ["blindtest.${data.sops_file.secrets.data["domainName"]}"]
    }
  }
}

resource "aws_lb_listener_rule" "blind_test_backend_listener_rule" {
  listener_arn = data.terraform_remote_state.central.outputs.https_listener_arn
  priority     = 120

  action {
    type             = "forward"
    target_group_arn = data.terraform_remote_state.central.outputs.blindtest_backend_tg_arn
  }

  condition {
    host_header {
      values = ["api-blindtest.${data.sops_file.secrets.data["domainName"]}"]
    }
  }
}
