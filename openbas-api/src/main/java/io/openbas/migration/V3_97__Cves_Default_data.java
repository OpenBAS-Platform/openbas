package io.openbas.migration;

import java.sql.Connection;
import java.sql.PreparedStatement;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
public class V3_97__Cves_Default_data extends BaseJavaMigration {

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();

    try (PreparedStatement insertCve =
            connection.prepareStatement(
                "INSERT INTO cves (cve_id, cve_source_identifier, cve_published, cve_description, cve_cvss, cve_cisa_exploit_add, cve_cisa_action_due, cve_cisa_required_action, cve_cisa_vulnerability_name) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (cve_id) DO NOTHING");
        PreparedStatement insertCwe =
            connection.prepareStatement(
                "INSERT INTO cwes (cwe_id, cwe_source) VALUES (?, ?) ON CONFLICT (cwe_id) DO NOTHING");
        PreparedStatement linkCveCwe =
            connection.prepareStatement(
                "INSERT INTO cves_cwes (cve_id, cwe_id) VALUES (?, ?) ON CONFLICT DO NOTHING");
        PreparedStatement insertRef =
            connection.prepareStatement(
                "INSERT INTO cve_reference_urls (cve_id, cve_reference_url) VALUES (?, ?) ON CONFLICT DO NOTHING"); ) {
      // --- CVE-2021-26855 ---
      insertCve.setString(1, "CVE-2021-26855");
      insertCve.setString(2, "NVD");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2021-03-02T00:00:00Z")));
      insertCve.setString(4, "Microsoft Exchange Server ProxyLogon SSRF leading to RCE.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("9.8"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2021-03-11T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2021-04-16T00:00:00Z")));
      insertCve.setString(8, "Apply updates per vendor instructions");
      insertCve.setString(9, "Microsoft Exchange Server Remote Code Execution Vulnerability \t");
      insertCve.executeUpdate();

      insertCwe.setString(1, "CWE-918");
      insertCwe.setString(2, "NVD");
      insertCwe.executeUpdate();

      linkCveCwe.setString(1, "CVE-2021-26855");
      linkCveCwe.setString(2, "CWE-918");
      linkCveCwe.executeUpdate();

      insertRef.setString(1, "CVE-2021-26855");
      insertRef.setString(
          2, "https://portal.msrc.microsoft.com/en-US/security-guidance/advisory/CVE-2021-26855");
      insertRef.executeUpdate();
      insertRef.setString(1, "CVE-2021-26855");
      insertRef.setString(
          2,
          "http://packetstormsecurity.com/files/161938/Microsoft-Exchange-ProxyLogon-Remote-Code-Execution.html");
      insertRef.executeUpdate();
      insertRef.setString(1, "CVE-2021-26855");
      insertRef.setString(2, "https://nvd.nist.gov/vuln/detail/CVE-2021-26855");
      insertRef.executeUpdate();

      // --- CVE-2023-20198 ---
      insertCve.setString(1, "CVE-2023-20198");
      insertCve.setString(2, "NVD");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-16T00:00:00Z")));
      insertCve.setString(
          4, "Cisco IOS XE Web UI remote code execution via unauthenticated command injection.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("10.0"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-16T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-20T00:00:00Z")));
      insertCve.setString(
          8,
          "Verify that instances of Cisco IOS XE Web UI are in compliance with BOD 23-02 and apply mitigations per vendor instructions. For affected products (Cisco IOS XE Web UI exposed to the internet or to untrusted networks), follow vendor instructions to determine if a system may have been compromised and immediately report positive findings to CISA.");
      insertCve.setString(9, "Cisco IOS XE Web UI Privilege Escalation Vulnerability");
      insertCve.executeUpdate();

      insertCwe.setString(1, "CWE-420");
      insertCwe.setString(2, "NVD");
      insertCwe.executeUpdate();

      linkCveCwe.setString(1, "CVE-2023-20198");
      linkCveCwe.setString(2, "CWE-420");
      linkCveCwe.executeUpdate();

      insertRef.setString(1, "CVE-2023-20198");
      insertRef.setString(
          2,
          "https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-iosxe-webui-privesc-j22SaA4z");
      insertRef.executeUpdate();
      insertRef.setString(1, "CVE-2023-20198");
      insertRef.setString(2, "https://nvd.nist.gov/vuln/detail/CVE-2023-20198");
      insertRef.executeUpdate();
      insertRef.setString(1, "CVE-2023-20198");
      insertRef.setString(2, "https://github.com/W01fh4cker/CVE-2023-20198-RCE");
      insertRef.executeUpdate();

      // --- CVE-2023-46805 ---
      insertCve.setString(1, "CVE-2023-46805");
      insertCve.setString(2, "NVD");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2024-01-12T00:00:00Z")));
      insertCve.setString(4, "Ivanti Connect Secure/Policy Secure gateway authentication bypass.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("8.2"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2024-01-10T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2024-01-22T00:00:00Z")));
      insertCve.setString(
          8,
          "Apply mitigations per vendor instructions or discontinue use of the product if mitigations are unavailable.");
      insertCve.setString(
          9, "Ivanti Connect Secure and Policy Secure Authentication Bypass Vulnerability");
      insertCve.executeUpdate();

      insertCwe.setString(1, "CWE-287");
      insertCwe.setString(2, "NVD");
      insertCwe.executeUpdate();

      linkCveCwe.setString(1, "CVE-2023-46805");
      linkCveCwe.setString(2, "CWE-287");
      linkCveCwe.executeUpdate();

      insertRef.setString(1, "CVE-2023-46805");
      insertRef.setString(2, "https://nvd.nist.gov/vuln/detail/CVE-2023-46805");
      insertRef.executeUpdate();
      insertRef.setString(1, "CVE-2023-46805");
      insertRef.setString(2, "https://www.twingate.com/blog/tips/cve-2023-46805");
      insertRef.executeUpdate();

      // --- CVE-2023-48788 ---
      insertCve.setString(1, "CVE-2023-48788");
      insertCve.setString(2, "NVD");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2023-12-01T00:00:00Z")));
      insertCve.setString(
          4,
          "A improper neutralization of special elements used in an sql command ('sql injection') in Fortinet FortiClientEMS version 7.2.0 through 7.2.2, FortiClientEMS 7.0.1 through 7.0.10 allows attacker to execute unauthorized code or commands via specially crafted packets.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("9.8"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2024-04-15T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2024-04-22T00:00:00Z")));
      insertCve.setString(
          8,
          "Apply mitigations per vendor instructions or discontinue use of the product if mitigations are unavailable.");
      insertCve.setString(9, "Fortinet FortiClient EMS SQL Injection Vulnerability");
      insertCve.executeUpdate();

      // --- CVE-2024-20353 ---
      insertCve.setString(1, "CVE-2024-20353");
      insertCve.setString(2, "MITRE");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2019-06-10T00:00:00Z")));
      insertCve.setString(
          4, "Use-after-free in mongoose.c (mg_http_get_proto_data) leading to DoS or RCE.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("8.6"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2024-04-10T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2024-05-22T00:00:00Z")));
      insertCve.setString(
          8,
          "Apply mitigations per vendor instructions or discontinue use of the product if mitigations are unavailable.");
      insertCve.setString(9, "Cisco ASA and FTD Denial of Service Vulnerability");
      insertCve.executeUpdate();

      insertRef.setString(1, "CVE-2024-20353");
      insertRef.setString(
          2,
          "https://github.com/insi2304/mongoose-6.13-fuzz/blob/master/Simplest_Web_Server_Use_After_Free-read-mg_http_get_proto_data5932.png");
      insertRef.executeUpdate();

      // --- CVE-2018-0171 ---
      insertCve.setString(1, "CVE-2018-0171");
      insertCve.setString(2, "NVD");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2018-05-14T00:00:00Z")));
      insertCve.setString(4, "Cisco Smart Install feature buffer overflow leading to RCE or DoS.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("9.8"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2021-03-10T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2021-03-22T00:00:00Z")));
      insertCve.setString(
          8,
          "Apply mitigations per vendor instructions or discontinue use of the product if mitigations are unavailable.");
      insertCve.setString(
          9, "Cisco IOS and IOS XE Software Smart Install Remote Code Execution Vulnerability");
      insertCve.executeUpdate();

      insertCwe.setString(1, "CWE-787");
      insertCwe.setString(2, "Out-of-bounds Write");
      insertCwe.executeUpdate();

      linkCveCwe.setString(1, "CVE-2018-0171");
      linkCveCwe.setString(2, "CWE-787");

      insertRef.setString(1, "CVE-2018-0171");
      insertRef.setString(2, "https://nvd.nist.gov/vuln/detail/CVE-2018-0171");
      insertRef.executeUpdate();

      // --- CVE-2023-20273 ---
      insertCve.setString(1, "CVE-2023-20273");
      insertCve.setString(2, "Cisco Systems, Inc.");
      insertCve.setTimestamp(
          3, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-16T00:00:00Z")));
      insertCve.setString(
          4,
          "Cisco IOS XE Web UI insufficient input validation leading to root command injection.");
      insertCve.setBigDecimal(5, new java.math.BigDecimal("7.2"));
      insertCve.setTimestamp(
          6, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-10T00:00:00Z")));
      insertCve.setTimestamp(
          7, java.sql.Timestamp.from(java.time.Instant.parse("2023-10-22T00:00:00Z")));
      insertCve.setString(
          8,
          "Verify that instances of Cisco IOS XE Web UI are in compliance with BOD 23-02 and apply mitigations per vendor instructions.");
      insertCve.setString(9, "Cisco IOS XE Web UI Command Injection Vulnerability");
      insertCve.executeUpdate();

      insertCwe.setString(1, "CWE-78");
      insertCwe.setString(2, "Nist");
      insertCwe.executeUpdate();

      linkCveCwe.setString(1, "CVE-2023-20273");
      linkCveCwe.setString(2, "CWE-78");

      insertRef.setString(1, "CVE-2023-20273");
      insertRef.setString(
          2,
          "https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-iosxe-webui-privesc-j22SaA4z");
      insertRef.executeUpdate();
    }
  }
}
