provider "aws" {
  region     = "{{aws_region}}"
  access_key = "{{aws_access_key}}"
  secret_key = "{{aws_secret_key}}"
}

resource "aws_instance" "app_server" {
  ami           = "{{ami_id}}"
  instance_type = "{{instance_type}}"
  key_name      = "{{key_name}}"

  tags = {
    Name = "{{project_name}}-ec2"
    }

    provisioner "remote-exec" {
      inline = [
        "sudo apt-get update -y",
        "sudo apt-get install -y python3"
      ]

      connection {
        type        = "ssh"
        user        = "{{ssh_user}}"
        private_key = file("~/.ssh/{{private_key}}")
        host        = self.public_ip
      }
    }
}

output "public_ip" {
  value = aws_instance.app_server.public_ip
}
