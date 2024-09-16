package io.openbas.injectors.openbas;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Endpoint;
import io.openbas.integrations.InjectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

@Component
@Log
public class OpenBASInjector {

    private static final String OPENBAS_INJECTOR_NAME = "OpenBAS Implant";
    private static final String OPENBAS_INJECTOR_ID = "49229430-b5b5-431f-ba5b-f36f599b0144";

    private String dlUri(OpenBASConfig openBASConfig, String platform, String arch) {
        return openBASConfig.getBaseUrlForAgent() + "/api/implant/openbas/" + platform + "/" + arch;
    }

    @SuppressWarnings("SameParameterValue")
    private String dlVar(OpenBASConfig openBASConfig, String platform, String arch) {
        return "$url=\"" + openBASConfig.getBaseUrl() + "/api/implant/openbas/" + platform + "/" + arch + "\"";
    }

    @Autowired
    public OpenBASInjector(InjectorService injectorService, OpenBASImplantContract contract, OpenBASConfig openBASConfig) {
        String tokenVar = "token=\"" + openBASConfig.getAdminToken() + "\"";
        String serverVar = "server=\"" + openBASConfig.getBaseUrlForAgent() + "\"";
        Map<String, String> executorCommands = new HashMap<>();
        executorCommands.put(Endpoint.PLATFORM_TYPE.Windows.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "$x=\"#{location}\";$location=$x.Replace(\"\\obas-agent-caldera.exe\", \"\");[Environment]::CurrentDirectory = $location;$filename=\"obas-implant-#{inject}.exe\";$" + tokenVar + ";$" + serverVar + ";" + dlVar(openBASConfig, "windows", "x86_64") + ";$wc=New-Object System.Net.WebClient;$data=$wc.DownloadData($url);[io.file]::WriteAllBytes($filename,$data) | Out-Null;Remove-NetFirewallRule -DisplayName \"Allow OpenBAS Inbound\";New-NetFirewallRule -DisplayName \"Allow OpenBAS Inbound\" -Direction Inbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Remove-NetFirewallRule -DisplayName \"Allow OpenBAS Outbound\";New-NetFirewallRule -DisplayName \"Allow OpenBAS Outbound\" -Direction Outbound -Program \"$location\\$filename\" -Action Allow | Out-Null;Start-Process -FilePath \"$location\\$filename\" -ArgumentList \"--uri $server --token $token --inject-id #{inject}\" -WindowStyle hidden;");
        executorCommands.put(Endpoint.PLATFORM_TYPE.Linux.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-#{inject};" + serverVar + ";" + tokenVar + ";curl -s -X GET " + dlUri(openBASConfig, "linux", "x86_64") + " > $location/$filename;chmod +x $location/$filename;$location/$filename --uri $server --token $token --inject-id #{inject} &");
        executorCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-#{inject};" + serverVar + ";" + tokenVar + ";curl -s -X GET " + dlUri(openBASConfig, "macos", "x86_64") + " > $location/$filename;chmod +x $location/$filename;$location/$filename --uri $server --token $token --inject-id #{inject} &");
        executorCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.arm64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");filename=obas-implant-#{inject};" + serverVar + ";" + tokenVar + ";curl -s -X GET " + dlUri(openBASConfig, "macos", "arm64") + " > $location/$filename;chmod +x $location/$filename;$location/$filename --uri $server --token $token --inject-id #{inject} &");
        Map<String, String> executorClearCommands = new HashMap<>();
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.Windows.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "$x=\"#{location}\";$location=$x.Replace(\"\\obas-agent-caldera.exe\", \"\");[Environment]::CurrentDirectory = $location;cd \"$location\";Get-ChildItem -Recurse -Filter *implant* | Remove-Item");
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.Linux.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.x86_64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
        executorClearCommands.put(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + Endpoint.PLATFORM_ARCH.arm64, "x=\"#{location}\";location=$(echo \"$x\" | sed \"s#/openbas-caldera-agent##\");cd \"$location\"; rm *implant*");
        try {
            injectorService.register(
                    OPENBAS_INJECTOR_ID,
                    OPENBAS_INJECTOR_NAME,
                    contract,
                    false,
                    "simulation-implant",
                    executorCommands,
                    executorClearCommands,
                    true
            );
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating OpenBAS implant injector (" + e.getMessage() + ")" + "\n" + Arrays.toString(e.getStackTrace()));
        }
    }
}
