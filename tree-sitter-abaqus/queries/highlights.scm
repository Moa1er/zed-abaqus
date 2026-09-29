; syntax highlighting queries for abaqus input decks

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

(keyword_name) @keyword

"*" @punctuation.special

[
  "="
] @operator

[
  ","
] @punctuation.delimiter

(parameter_name) @variable.parameter

(string) @string

(number) @number

(parameter_value
  (text) @constant)

(data_line
  (text) @variable)
