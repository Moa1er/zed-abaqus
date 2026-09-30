// zed extension bridge for abaqus language server

use zed_extension_api::{self as zed, LanguageServerId, Result, Worktree};

struct AbaqusExtension;

impl zed::Extension for AbaqusExtension {
    fn new() -> Self {
        AbaqusExtension
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<zed::Command> {
        let node_path = zed::node_binary_path()?;
        let server_script = worktree
            .which("abaqus-language-server")
            .unwrap_or_else(|| "C:/github/zed-abaqus/server/src/index.js".to_string());

        Ok(zed::Command {
            command: node_path,
            args: vec![server_script],
            env: Default::default(),
        })
    }
}

zed::register_extension!(AbaqusExtension);
