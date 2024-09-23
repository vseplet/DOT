import { zsh } from "@vseplet/shelly";
import { showActiveProfileStatus } from "./activateProfile.ts";
import { ensureFile } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { getUserInput } from "./service.ts";
import { Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

const CURRENTDIRECTORY = Deno.cwd();
const PATHTOGITCONFIG = `${Deno.env.get("HOME")}/.ssh/DOT/config`;
const PATHTODOT = `${Deno.env.get("HOME")}/.ssh/DOT/`;

export async function gitClone() {
  const activeUserStatus = await showActiveProfileStatus(true);
  if (activeUserStatus === false) {
    console.log("Select and activate a profile first");
    return;
  }
  console.log(
    `When cloning a repository, the SSH key of the currently active profile will be linked to its local version.`,
  );
  console.log(`Current key: ${activeUserStatus?.ssh}`);
  const confirmed: boolean = await Confirm.prompt("Do you understand?");
  if (!confirmed) {
    console.log("Cancel cloning");
    return;
  }

  const ssh = activeUserStatus?.ssh as string ?? "Empty";
  const gitCloneURL = await getUserInput(
    "Paste the link to clone the repository via SSH",
  );
  const repositoryName = await getUserInput(
    "Enter a unique name for this clone.",
  );
  const parseGitUrlData = await parseGitUrl(gitCloneURL);

  await updateConfigToNewLocalRepository(
    repositoryName,
    ssh,
    parseGitUrlData.source,
  );
  console.log("Update config..... Done.");

  await zsh(`git clone ${gitCloneURL}`);
  console.log("Repository clone..... Done");

  await zsh(
    `git -C ${CURRENTDIRECTORY}/${parseGitUrlData.projectName} \
    remote set-url origin git@${repositoryName}:${parseGitUrlData.username}/${parseGitUrlData.repository}`,
  );
  await zsh(`source ~/.zshrc`);

  console.log("Git set new URL..... Done");

  console.log("The process has been completed successfully.");
}

// Как заменить выброс ошибки простым сообщением?
function parseGitUrl(
  url: string,
): {
  source: string;
  username: string;
  repository: string;
  projectName: string;
} {
  const regex = /^git@([^:]+):([^/]+)\/(.+)$/;

  const match = url.match(regex);

  if (!match) {
    console.log(
      "Incorrect link format, check that it looks something like this:",
    );
    console.log("git@github.com-repo1:username/repository.git");
    throw new Error("Invalid Git URL format");
  }

  const [, source, username, repository] = match;
  const projectName = repository.replace(/\.git$/, "");

  return { source, username, repository, projectName };
}

async function updateConfigToNewLocalRepository(
  repositoryName: string,
  sshKey: string,
  source: string,
) {
  const updateBlock = `Host ${repositoryName}
HostName ${source}
User git
AddKeysToAgent yes
UseKeychain yes
IdentityFile ${Deno.env.get("HOME")}/.ssh/DOT/${sshKey}
IdentitiesOnly yes
UserKnownHostsFile ${PATHTODOT}known_hosts`;

  await ensureFile(PATHTOGITCONFIG);
  const file = await Deno.open(PATHTOGITCONFIG, {
    write: true,
    append: true,
  });
  const encoder = new TextEncoder();
  await file.write(encoder.encode("\n" + "\n" + updateBlock));
  file.close();
}
