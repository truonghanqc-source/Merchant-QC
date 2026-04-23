pipeline {
  agent {
    // Dùng Docker image Playwright chính thức — có sẵn browsers + dependencies
    docker {
      image 'mcr.microsoft.com/playwright:v1.59.1-jammy'
      args '--ipc=host'
    }
  }

  options {
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    timestamps()
  }

  parameters {
    string(
      name: 'TEST_GREP',
      defaultValue: '',
      description: 'Filter tests by name (e.g. @smoke). Leave empty to run all.'
    )
    choice(
      name: 'TEST_SUITE',
      choices: ['all', 'auth', 'bookingservice', 'courses', 'logsadmin', 'pgpb', 'product', 'purchase', 'quotation', 'report', 'returnproduct', 'settingadmin', 'users', 'vendors'],
      description: 'Which test suite to run'
    )
    choice(
      name: 'TEST_SCOPE',
      choices: ['all', 'smoke', 'regression'],
      description: 'Quick scope selector by tag. TEST_GREP takes priority when provided.'
    )
    string(
      name: 'TEST_WORKERS',
      defaultValue: '20',
      description: 'Number of Playwright workers'
    )

  }

  environment {
    BASE_URL         = credentials('MERCHANT_BASE_URL')
    LOGIN_USER_ADMIN = credentials('MERCHANT_LOGIN_USER_ADMIN')
    LOGIN_PASS_ADMIN = credentials('MERCHANT_LOGIN_PASS_ADMIN')
    LOGIN_USER_MERCHANT = credentials('MERCHANT_LOGIN_USER_MERCHANT')
    LOGIN_PASS_MERCHANT = credentials('MERCHANT_LOGIN_PASS_MERCHANT')
    CI               = 'true'
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        script {
          def suitePath = params.TEST_SUITE == 'all' ? '' : "tests/${params.TEST_SUITE}/"
          def scopeGrep = ''
          if (params.TEST_SCOPE == 'smoke') {
            scopeGrep = '@smoke'
          } else if (params.TEST_SCOPE == 'regression') {
            scopeGrep = '@regression'
          }

          def finalGrep = params.TEST_GREP?.trim() ? params.TEST_GREP.trim() : scopeGrep
          def grepFlag = finalGrep ? "--grep \"${finalGrep}\"" : ''
          def workersFlag = params.TEST_WORKERS?.trim() ? "--workers=${params.TEST_WORKERS.trim()}" : ''

          echo "Running suite: ${params.TEST_SUITE}, scope: ${params.TEST_SCOPE}, grep: ${finalGrep ?: 'none'}, workers: ${params.TEST_WORKERS}"
          sh "npx playwright test ${suitePath} ${grepFlag} ${workersFlag}"
        }
      }
    }
  }

  post {
    always {
      // Publish HTML report (requires HTML Publisher plugin)
      publishHTML(target: [
        allowMissing:          true,
        alwaysLinkToLastBuild: true,
        keepAll:               true,
        reportDir:             'playwright-report',
        reportFiles:           'index.html',
        reportName:            'Playwright HTML Report'
      ])

      // Publish JUnit results (native Jenkins test results)
      junit(
        testResults:          'test-results/junit.xml',
        allowEmptyResults:    true
      )

      // Archive trace & screenshots on failure
      archiveArtifacts(
        artifacts:     'playwright-report/**/*,test-results/**/*',
        allowEmptyArchive: true
      )
    }

    failure {
      emailext(
        to:      '${DEFAULT_RECIPIENTS}',
        subject: "FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
        body:    """
          Build failed: ${env.BUILD_URL}
          Branch: ${env.GIT_BRANCH}
          See Playwright report for details.
        """
      )
    }
  }
}
