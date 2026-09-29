; syntax highlighting queries for abaqus input decks

; comments
(comment) @comment

; structural block keywords
[
  (step_keyword_line)
  (end_step_keyword_line)
  (part_keyword_line)
  (end_part_keyword_line)
  (assembly_keyword_line)
  (end_assembly_keyword_line)
  (instance_keyword_line)
  (end_instance_keyword_line)
] @keyword

; general keyword names
(keyword_name) @keyword

; keyword prefix asterisk
"*" @punctuation.special

; operators and delimiters
"=" @operator
"," @punctuation.delimiter

; parameter names (keys)
(parameter_name) @property

; boolean parameter values (yes / no / true / false)
(parameter_value
  (text) @boolean
  (#match? @boolean "(?i)^(yes|no|true|false)$"))

; element type parameter values
(parameter
  name: (parameter_name) @_pname
  (#match? @_pname "(?i)^type$")
  value: (parameter_value
    (text) @type))

; string literals and numeric values
(string) @string
(number) @number

; general parameter values (names, sets, materials)
(parameter_value
  (text) @string.special.symbol)

; identifiers, sets, and variables on data lines
(data_line
  (text) @variable.special)
