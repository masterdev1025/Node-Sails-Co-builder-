node {
    def remote = [:]
    remote.name = "root"
    remote.host = "104.219.248.148"
    remote.port = 22
    remote.allowAnyHosts = true

    def app
    stage('SCM') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */
        checkout scm
    }
    stage("The CoBuilder API"){
        withCredentials([usernamePassword(credentialsId: 'thecobuilders_stage_vpshost', passwordVariable: 'password', usernameVariable: 'username')]) {
            remote.user = username
            remote.password = password
            sshCommand remote: remote, command: "cd /var/www/html/thecobuilders-api/ && git pull && pm2 restart 0"
        }
    }
}
