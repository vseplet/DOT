import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { getProfileList } from "./profileManager.ts";
import { getAllSshKeysList } from "./sshKeyGen.ts";

export async function selectUserCore(dataArray: Array<Deno.KvEntry<string>>) {
    const data = await dataArray;
  
    if (data.length > 0) {
      const selectedObject = await Select.prompt({
        message: "Select User",
        options: data.map((key) => ({
          name: key.key[1] as string,
          value: { userName: key.key[1], sshKey: key.value[1], email: key.key[3] },
        })),
      });
  
      const { userName, sshKey, email } = selectedObject as unknown as {
        userName: string;
        sshKey: string;
        email: string;
      };
  
      return [userName, sshKey, email];
  
    } else {
      console.log("No data found.");
    }
  }

export async function selectSshKeyCore(dataArray: Array<Deno.KvEntry<string>>) {
    const data = await dataArray;
  
    if (data.length > 0) {
      const selectedObject = await Select.prompt({
        message: "Select SSH Key",
        options: data.map((key) => ({
          name: key.key[1] as string,
          value: { keyName: key.key[1], keyAdress: key.key[3], conectionUser: key.value[1] },
        })),
      });
  
      const { keyName, keyAdress, conectionUser } = selectedObject as unknown as {
        keyName: string;
        keyAdress: string;
        conectionUser: string;
      };
  
      return [keyName, keyAdress, conectionUser];
  
    } else {
      console.log("No data found.");
    }
  }

//----------------------------------------------------------


//   async function testSelectCore() {
//     const data = await getProfileList();
//     const result = await testSelectUserCore(data);  
//     console.log(result);     
//   };


// testSelectCore();

