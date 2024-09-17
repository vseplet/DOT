import { chooseUser } from "./userManager.ts";
import { choseSshKey } from "./sshKeyManager.ts";

async function keyRecording(user: string, sshKey: string, email: string) {
  const kv = await Deno.openKv();

  await kv.set(["userName:", user], ["connectedSSH", sshKey, "Email:", email]);
  await kv.set(["sshKeyName:", sshKey], ["connectedUser", user]);

  console.log(`User ${user} connected to SSH key ${sshKey}`);

  kv.close();
}

export async function connectUserToSsh() {
  const userListResult = await chooseUser(false);
  const sshListResult = await choseSshKey(false);

  if (userListResult === undefined || sshListResult === undefined) {
    console.log("List is empty");
    return;
  }

  const name = userListResult?.[0] ?? "Unknown";
  const email = userListResult?.[2] ?? "Unknown";
  const conectionSSH = userListResult?.[1] ?? "Unknown";
  const conectionUser = sshListResult?.[1] ?? "Unknown";
  const nameKey = sshListResult?.[0] ?? "Unknown";

  if (conectionSSH !== "Empty" || conectionUser !== "Empty") {
    console.log("The user or key already has a connection.");
    console.log("First, perform a disconnection.");
    return;
  }

  console.log(`SSH key: ${nameKey}`);
  console.log(`You selected: ${name}`);
  console.log(`You selected ssh key: ${nameKey}`);

  await keyRecording(name, nameKey, email);
}

// connectUserToSsh();
