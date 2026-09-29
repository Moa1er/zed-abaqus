// external scanner for detecting eof without trailing newline

#include "tree_sitter/parser.h"

enum TokenType {
  END_OF_FILE,
};

void *tree_sitter_abaqus_external_scanner_create(void) {
  return NULL;
}

void tree_sitter_abaqus_external_scanner_destroy(void *payload) {
}

unsigned tree_sitter_abaqus_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_abaqus_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

bool tree_sitter_abaqus_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (valid_symbols[END_OF_FILE] && lexer->eof(lexer)) {
    lexer->result_symbol = END_OF_FILE;
    return true;
  }
  return false;
}
