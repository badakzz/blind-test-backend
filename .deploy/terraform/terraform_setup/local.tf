locals {
  org         = yamldecode(file("${path.module}/../org.yaml"))
  name        = local.org.accounts.main.name
  account     = local.org.accounts.main
  common_tags = merge(local.org.common_tags, local.account.common_tags)
}
