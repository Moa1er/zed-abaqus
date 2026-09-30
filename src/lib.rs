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
        // check if abaqus-language-server is installed in PATH
        if let Some(path) = worktree.which("abaqus-language-server") {
            return Ok(zed::Command {
                command: path,
                args: vec![],
                env: Default::default(),
            });
        }

        // if node is available, look for server script in workspace or fallback
        if let Ok(node_path) = zed::node_binary_path() {
            if let Some(script_path) = worktree.which("abaqus-lsp") {
                return Ok(zed::Command {
                    command: node_path,
                    args: vec![script_path],
                    env: Default::default(),
                });
            }
        }

        Err("abaqus-language-server not found. configure binary path in settings.json or install abaqus-language-server".to_string())
    }
}

zed::register_extension!(AbaqusExtension);
