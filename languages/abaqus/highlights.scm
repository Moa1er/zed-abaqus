; syntax highlighting for abaqus input decks in zed

(comment) @comment

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
