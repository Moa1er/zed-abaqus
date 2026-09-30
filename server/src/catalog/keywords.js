// abaqus keyword catalog and parameter specification dictionary
// provides completion metadata, allowed choices, and hover documentation

const keywords = {
  '*HEADING': {
    name: '*HEADING',
    description: 'Defines the title of the analysis. A single optional data line follows, containing descriptive text for the job.',
    parameters: {},
    dataLineFormat: 'Descriptive title text (up to 80 characters per line).'
  },
  '*PREPRINT': {
    name: '*PREPRINT',
    description: 'Controls the printing of solver echo, model data, and history output to the print file (.dat).',
    parameters: {
      'echo': { description: 'Prints an echo of the input deck.', choices: ['YES', 'NO'], default: 'NO' },
      'model': { description: 'Prints model input data summary.', choices: ['YES', 'NO'], default: 'NO' },
      'history': { description: 'Prints history output data.', choices: ['YES', 'NO'], default: 'NO' },
      'contact': { description: 'Prints contact constraint information.', choices: ['YES', 'NO'], default: 'NO' }
    }
  },
  '*PART': {
    name: '*PART',
    description: 'Begins the definition of a part in an Abaqus model. Must terminate with *END PART.',
    parameters: {
      'name': { description: 'Unique name of the part.', required: true, type: 'string' }
    }
  },
  '*END PART': {
    name: '*END PART',
    description: 'Terminates a *PART definition block.',
    parameters: {}
  },
  '*ASSEMBLY': {
    name: '*ASSEMBLY',
    description: 'Begins the definition of the global assembly containing part instances and constraints. Terminates with *END ASSEMBLY.',
    parameters: {
      'name': { description: 'Name of the assembly.', default: 'Assembly' }
    }
  },
  '*END ASSEMBLY': {
    name: '*END ASSEMBLY',
    description: 'Terminates an *ASSEMBLY block.',
    parameters: {}
  },
  '*INSTANCE': {
    name: '*INSTANCE',
    description: 'Instantiates a defined part within the assembly. Must terminate with *END INSTANCE.',
    parameters: {
      'name': { description: 'Unique name for this part instance.', required: true },
      'part': { description: 'Name of the referenced part.', required: true },
      'dependent': { description: 'Whether the mesh is dependent on the part.', choices: ['YES', 'NO'] }
    },
    dataLineFormat: 'Translation coordinates (X, Y, Z) and rotation axis/angle lines.'
  },
  '*END INSTANCE': {
    name: '*END INSTANCE',
    description: 'Terminates an *INSTANCE block.',
    parameters: {}
  },
  '*NODE': {
    name: '*NODE',
    description: 'Defines nodal coordinates.',
    parameters: {
      'nset': { description: 'Node set to which newly created nodes are assigned.' },
      'system': { description: 'Coordinate system: R (Cartesian), C (Cylindrical), S (Spherical).', choices: ['R', 'C', 'S'] },
      'input': { description: 'External file containing node definitions.' }
    },
    dataLineFormat: 'node_number, x_coord, y_coord, z_coord'
  },
  '*ELEMENT': {
    name: '*ELEMENT',
    description: 'Defines finite elements and their nodal connectivity.',
    parameters: {
      'type': {
        description: 'FEA element formulation identifier.',
        required: true,
        choices: [
          'C3D8', 'C3D8R', 'C3D8I', 'C3D8H', 'C3D8RH',
          'C3D20', 'C3D20R', 'C3D20H', 'C3D20RH',
          'C3D4', 'C3D4H', 'C3D10', 'C3D10M', 'C3D10H',
          'CPS4', 'CPS4R', 'CPS4I', 'CPS8', 'CPS8R', 'CPS3', 'CPS6',
          'CPE4', 'CPE4R', 'CPE4I', 'CPE8', 'CPE8R', 'CPE3', 'CPE6',
          'CAX4', 'CAX4R', 'CAX4I', 'CAX8', 'CAX8R',
          'S4', 'S4R', 'S4R5', 'S3', 'S3R', 'STRI65',
          'B31', 'B31OS', 'B32', 'B32OS', 'B21', 'B22',
          'T3D2', 'T3D3', 'T2D2', 'T2D3',
          'COH3D8', 'COH2D4', 'COHAX4',
          'M3D4', 'M3D4R', 'M3D3',
          'CIN3D8', 'CINPE4', 'CINAX4'
        ]
      },
      'elset': { description: 'Element set to which newly defined elements are assigned.' },
      'input': { description: 'External file containing element definitions.' }
    },
    dataLineFormat: 'element_number, node1, node2, node3, ...'
  },
  '*NSET': {
    name: '*NSET',
    description: 'Groups nodes into a named node set for applying loads, boundaries, or output requests.',
    parameters: {
      'nset': { description: 'Name of the node set being defined.', required: true },
      'generate': { description: 'Generates intermediate nodes from start, end, and increment.', type: 'flag' },
      'instance': { description: 'Part instance name when defining set in assembly.' }
    },
    dataLineFormat: 'node_id1, node_id2, ... OR (with generate): start_node, end_node, increment'
  },
  '*ELSET': {
    name: '*ELSET',
    description: 'Groups elements into a named element set for section assignments, properties, or loads.',
    parameters: {
      'elset': { description: 'Name of the element set being defined.', required: true },
      'generate': { description: 'Generates intermediate elements from start, end, and increment.', type: 'flag' },
      'instance': { description: 'Part instance name when defining set in assembly.' }
    },
    dataLineFormat: 'element_id1, element_id2, ... OR (with generate): start_el, end_el, increment'
  },
  '*MATERIAL': {
    name: '*MATERIAL',
    description: 'Begins a constitutive material definition block. Specific material behavior cards (e.g. *Elastic, *Plastic, *Hyperelastic) follow.',
    parameters: {
      'name': { description: 'Unique name of the material.', required: true }
    }
  },
  '*DENSITY': {
    name: '*DENSITY',
    description: 'Specifies material mass density, required for dynamic and inertial procedures.',
    parameters: {},
    dataLineFormat: 'mass_density, temperature'
  },
  '*ELASTIC': {
    name: '*ELASTIC',
    description: 'Defines linear elastic mechanical properties.',
    parameters: {
      'type': {
        description: 'Symmetry formulation of elasticity.',
        choices: ['ISOTROPIC', 'ENGINEERING CONSTANTS', 'ORTHOTROPIC', 'ANISOTROPIC', 'LAMINA', 'TRACTION'],
        default: 'ISOTROPIC'
      },
      'moduli': { description: 'Elastic moduli specification mode.', choices: ['INSTANTANEOUS', 'LONG TERM'] },
      'dependencies': { description: 'Number of field variable dependencies.' }
    },
    dataLineFormat: 'Young\'s_modulus, Poisson\'s_ratio, temperature'
  },
  '*PLASTIC': {
    name: '*PLASTIC',
    description: 'Defines classical metal plasticity hardening behavior.',
    parameters: {
      'hardening': { description: 'Hardening model type.', choices: ['ISOTROPIC', 'KINEMATIC', 'COMBINED', 'JOHNSON COOK'], default: 'ISOTROPIC' },
      'rate': { description: 'Strain rate dependency formulation.', choices: ['POWER LAW', 'YIELD RATIO'] }
    },
    dataLineFormat: 'yield_stress, plastic_strain, temperature, field_vars...'
  },
  '*HYPERELASTIC': {
    name: '*HYPERELASTIC',
    description: 'Defines finite-strain rubber-like hyperelastic material behavior.',
    parameters: {
      'ogden': { description: 'Ogden strain energy potential formulation.', type: 'flag' },
      'mooney-rivlin': { description: 'Mooney-Rivlin strain energy potential.', type: 'flag' },
      'neo hooke': { description: 'Neo-Hookean strain energy potential.', type: 'flag' },
      'yeoh': { description: 'Yeoh strain energy potential.', type: 'flag' },
      'arruda-boyce': { description: 'Arruda-Boyce 8-chain model.', type: 'flag' },
      'polynomial': { description: 'General polynomial strain energy function.', type: 'flag' },
      'marlow': { description: 'Marlow test data based model.', type: 'flag' },
      'n': { description: 'Polynomial order N (typically 1, 2, or 3).' },
      'test data input': { description: 'Fit potential coefficients from experimental test data.', type: 'flag' }
    },
    dataLineFormat: 'mu_1, alpha_1, mu_2, alpha_2, ..., D_1, D_2, ...'
  },
  '*EXPANSION': {
    name: '*EXPANSION',
    description: 'Specifies thermal expansion coefficients for thermo-mechanical analysis.',
    parameters: {
      'type': { choices: ['ISOTROPIC', 'ORTHOTROPIC', 'ANISOTROPIC'], default: 'ISOTROPIC' },
      'zero': { description: 'Reference temperature for zero thermal expansion.' }
    },
    dataLineFormat: 'alpha, temperature'
  },
  '*SOLID SECTION': {
    name: '*SOLID SECTION',
    description: 'Assigns material properties and orientation to continuum solid elements.',
    parameters: {
      'elset': { description: 'Target element set name.', required: true },
      'material': { description: 'Assigned material definition name.', required: true },
      'orientation': { description: 'Name of *ORIENTATION coordinate system.' },
      'controls': { description: 'Section controls for hourglassing or distortion.' }
    },
    dataLineFormat: 'thickness (optional for 2D plane stress/strain)'
  },
  '*SHELL SECTION': {
    name: '*SHELL SECTION',
    description: 'Assigns thickness, material, and integration rules to structural shell elements.',
    parameters: {
      'elset': { description: 'Target element set name.', required: true },
      'material': { description: 'Assigned material definition name.', required: true },
      'offset': { description: 'Reference surface offset.', choices: ['SPOS', 'SNEG', 'MID'] },
      'nodal thickness': { description: 'Interpolate shell thickness from nodal values.', type: 'flag' }
    },
    dataLineFormat: 'shell_thickness, num_integration_points'
  },
  '*BEAM SECTION': {
    name: '*BEAM SECTION',
    description: 'Assigns beam cross-section geometry and material properties.',
    parameters: {
      'elset': { description: 'Target element set name.', required: true },
      'material': { description: 'Assigned material definition name.', required: true },
      'section': {
        description: 'Cross-section profile type.',
        choices: ['CIRC', 'RECT', 'PIPE', 'BOX', 'I', 'L', 'T', 'ARBITRARY', 'GENERAL'],
        required: true
      }
    },
    dataLineFormat: 'Profile dimensions followed by direction vector line.'
  },
  '*COHESIVE SECTION': {
    name: '*COHESIVE SECTION',
    description: 'Assigns material and response formulation to cohesive interface elements.',
    parameters: {
      'elset': { description: 'Target cohesive element set.', required: true },
      'material': { description: 'Cohesive traction-separation material.', required: true },
      'response': { choices: ['TRACTION SEPARATION', 'CONTINUUM', 'GASKET'], default: 'TRACTION SEPARATION' }
    },
    dataLineFormat: 'initial_thickness'
  },
  '*STEP': {
    name: '*STEP',
    description: 'Begins an analysis step. Analysis procedures (e.g. *Static, *Dynamic), loads, and outputs follow. Terminates with *END STEP.',
    parameters: {
      'name': { description: 'Name of the analysis step.', required: true },
      'nlgeom': { description: 'Accounts for geometric nonlinearities (large deformations/rotations).', choices: ['YES', 'NO'], default: 'NO' },
      'inc': { description: 'Maximum number of increments allowed in this step.', default: '100' },
      'unsymm': { description: 'Uses unsymmetric matrix storage and solver.', choices: ['YES', 'NO'] },
      'perturbation': { description: 'Linear perturbation step.', type: 'flag' },
      'amplitude': { description: 'Step-level default amplitude reference.', choices: ['STEP', 'RAMP'] }
    }
  },
  '*END STEP': {
    name: '*END STEP',
    description: 'Terminates an analysis step block.',
    parameters: {}
  },
  '*STATIC': {
    name: '*STATIC',
    description: 'Specifies a quasi-static nonlinear or linear stress analysis procedure.',
    parameters: {
      'direct': { description: 'Direct user-controlled time incrementation.', type: 'flag' },
      'stabilize': { description: 'Automatic artificial damping for local instabilities.' },
      'allsdtol': { description: 'Maximum allowable ratio of stabilization energy to strain energy.' },
      'continue': { description: 'Continue damping stabilization from previous step.', choices: ['YES', 'NO'] }
    },
    dataLineFormat: 'initial_inc, time_period, min_inc, max_inc'
  },
  '*DYNAMIC': {
    name: '*DYNAMIC',
    description: 'Specifies a transient direct-integration dynamic analysis procedure.',
    parameters: {
      'explicit': { description: 'Uses explicit central-difference time integration.', type: 'flag' },
      'direct': { description: 'Direct user-specified time increments.', type: 'flag' },
      'alpha': { description: 'Hilber-Hughes-Taylor numerical damping parameter.' }
    },
    dataLineFormat: 'initial_inc, time_period, min_inc, max_inc'
  },
  '*FREQUENCY': {
    name: '*FREQUENCY',
    description: 'Extracts natural frequencies and mode shapes of the system.',
    parameters: {
      'eigensolver': { choices: ['LANCZOS', 'SUBSPACE', 'AMS'], default: 'LANCZOS' }
    },
    dataLineFormat: 'number_of_eigenvalues, min_frequency, max_frequency'
  },
  '*BOUNDARY': {
    name: '*BOUNDARY',
    description: 'Specifies prescribed boundary conditions (displacement, velocity, or acceleration degrees of freedom).',
    parameters: {
      'type': { choices: ['DISPLACEMENT', 'VELOCITY', 'ACCELERATION'], default: 'DISPLACEMENT' },
      'amplitude': { description: 'Name of the referenced amplitude curve.' },
      'load case': { description: 'Load case identifier.' },
      'fixed': { description: 'Fixes current displacement degrees of freedom.', type: 'flag' },
      'op': { description: 'Operation: MOD (modify) or NEW (replace existing).', choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'node_or_nset, first_dof, last_dof, magnitude'
  },
  '*CLOAD': {
    name: '*CLOAD',
    description: 'Applies concentrated nodal point loads.',
    parameters: {
      'amplitude': { description: 'Name of the referenced amplitude curve.' },
      'follower': { description: 'Load rotates with structural rotation.', choices: ['YES', 'NO'] },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'node_or_nset, dof, magnitude'
  },
  '*DLOAD': {
    name: '*DLOAD',
    description: 'Applies distributed pressure, body, or surface loads to elements.',
    parameters: {
      'amplitude': { description: 'Name of referenced amplitude curve.' },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'elset, load_type_label, magnitude'
  },
  '*DSLOAD': {
    name: '*DSLOAD',
    description: 'Applies distributed surface loads to named geometric surfaces.',
    parameters: {
      'amplitude': { description: 'Name of referenced amplitude curve.' },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'surface_name, load_type (e.g. P), magnitude'
  },
  '*AMPLITUDE': {
    name: '*AMPLITUDE',
    description: 'Defines an amplitude variation curve over step time or frequency.',
    parameters: {
      'name': { description: 'Name of the amplitude curve.', required: true },
      'definition': { choices: ['TABULAR', 'EQUALLY SPACED', 'PERIODIC', 'SMOOTH STEP', 'SOLUTION DEPENDENT'], default: 'TABULAR' },
      'time': { choices: ['STEP TIME', 'TOTAL TIME'], default: 'STEP TIME' }
    },
    dataLineFormat: 'time_1, value_1, time_2, value_2, ...'
  },
  '*EQUATION': {
    name: '*EQUATION',
    description: 'Defines a linear multi-point constraint equation between degrees of freedom.',
    parameters: {},
    dataLineFormat: 'Line 1: number_of_terms\nLine 2: node_or_nset, dof, coefficient, ...'
  },
  '*TIE': {
    name: '*TIE',
    description: 'Ties two surface regions together, constraining translational and rotational motion.',
    parameters: {
      'name': { description: 'Unique name of the tie constraint.', required: true },
      'position tolerance': { description: 'Distance tolerance for searching tied nodes.' },
      'adjust': { description: 'Adjusts slave nodes to lie on master surface.', choices: ['YES', 'NO'], default: 'YES' }
    },
    dataLineFormat: 'slave_surface_or_nset, master_surface_or_nset'
  },
  '*SURFACE': {
    name: '*SURFACE',
    description: 'Defines a geometric surface from element faces or node sets.',
    parameters: {
      'name': { description: 'Name of the surface.', required: true },
      'type': { choices: ['ELEMENT', 'NODE', 'SEGMENT', 'CYLINDER'], default: 'ELEMENT' }
    },
    dataLineFormat: 'elset_or_nset, face_identifier (e.g. S1, S2, SPOS)'
  },
  '*SURFACE INTERACTION': {
    name: '*SURFACE INTERACTION',
    description: 'Defines interaction properties between contacting surfaces.',
    parameters: {
      'name': { description: 'Name of the interaction property.', required: true }
    }
  },
  '*FRICTION': {
    name: '*FRICTION',
    description: 'Defines Coulomb friction or shear stress limits for surface interactions.',
    parameters: {
      'rough': { description: 'Infinite friction (no slip allowed).', type: 'flag' },
      'shear stress limit': { description: 'Maximum allowable frictional shear stress.' }
    },
    dataLineFormat: 'friction_coefficient, slip_tolerance'
  },
  '*CONTACT PAIR': {
    name: '*CONTACT PAIR',
    description: 'Specifies pairwise contact between two defined surfaces.',
    parameters: {
      'interaction': { description: 'Name of the associated *SURFACE INTERACTION.', required: true },
      'small sliding': { description: 'Assumes small relative sliding between surfaces.', type: 'flag' },
      'adjust': { description: 'Node set or distance for initial contact closure.' }
    },
    dataLineFormat: 'slave_surface, master_surface'
  },
  '*OUTPUT': {
    name: '*OUTPUT',
    description: 'Specifies output request destination and frequency.',
    parameters: {
      'field': { description: 'Field output written to the output database (.odb).', type: 'flag' },
      'history': { description: 'History output written to the output database (.odb).', type: 'flag' },
      'variable': { choices: ['PRESELECT', 'ALL'] },
      'frequency': { description: 'Output written every N increments.' },
      'time interval': { description: 'Output written at specified time intervals.' },
      'time marks': { choices: ['YES', 'NO'], default: 'NO' }
    }
  },
  '*NODE OUTPUT': {
    name: '*NODE OUTPUT',
    description: 'Requests nodal output variables (displacement, reaction forces, temperature).',
    parameters: {
      'nset': { description: 'Restricts output to specified node set.' }
    },
    dataLineFormat: 'U, RF, CF, V, A, NT, COORD, ...'
  },
  '*ELEMENT OUTPUT': {
    name: '*ELEMENT OUTPUT',
    description: 'Requests element integration point output variables (stress, strain, energy).',
    parameters: {
      'elset': { description: 'Restricts output to specified element set.' },
      'directions': { description: 'Include element local material directions.', choices: ['YES', 'NO'], default: 'NO' },
      'position': { choices: ['INTEGRATION POINTS', 'CENTROIDAL', 'NODES', 'AVERAGED AT NODES'] }
    },
    dataLineFormat: 'S, E, LE, NE, PE, PEEQ, ENER, SDV, STATUS, ...'
  },
  '*RESTART': {
    name: '*RESTART',
    description: 'Controls saving and reading restart data for resuming analyses.',
    parameters: {
      'write': { description: 'Write restart data.', type: 'flag' },
      'read': { description: 'Read restart data to continue analysis.', type: 'flag' },
      'frequency': { description: 'Write restart information every N increments.' },
      'step': { description: 'Step number to resume from (when read).' },
      'inc': { description: 'Increment number to resume from (when read).' }
    }
  },
  '*CONTROLS': {
    name: '*CONTROLS',
    description: 'Adjusts nonlinear equation solver iteration controls, tolerances, and time increments.',
    parameters: {
      'reset': { description: 'Resets all parameters to solver defaults.', type: 'flag' },
      'parameters': { choices: ['TIME INCREMENTATION', 'FIELD', 'LINE SEARCH'], default: 'TIME INCREMENTATION' },
      'analysis': { choices: ['DISCONTINUOUS'] }
    },
    dataLineFormat: 'Tolerances and iteration limits separated by commas.'
  },
  '*INCLUDE': {
    name: '*INCLUDE',
    description: 'Includes external Abaqus input decks or mesh card files (.inp, .inc, .incl).',
    parameters: {
      'input': { description: 'Relative or absolute file path to included deck.', required: true }
    }
  },
  '*ORIENTATION': {
    name: '*ORIENTATION',
    description: 'Defines a local coordinate system for material orientation or anisotropic behaviors.',
    parameters: {
      'name': { description: 'Unique name of the local coordinate system.', required: true },
      'system': { description: 'Coordinate system type: RECTANGULAR, CYLINDRICAL, or ZCYLINDRICAL.', choices: ['RECTANGULAR', 'CYLINDRICAL', 'ZCYLINDRICAL'], default: 'RECTANGULAR' },
      'definition': { choices: ['COORDINATES', 'NODES', 'OFFSET TO NODES'], default: 'COORDINATES' }
    },
    dataLineFormat: 'Line 1: point_a_coords, point_b_coords\nLine 2: rotation_axis, rotation_angle'
  },
  '*TRANSFORM': {
    name: '*TRANSFORM',
    description: 'Specifies a local coordinate system for displacement, velocity, and force degrees of freedom at nodes.',
    parameters: {
      'nset': { description: 'Node set for which the local transformation applies.', required: true },
      'type': { choices: ['R', 'C', 'S'], default: 'R' }
    },
    dataLineFormat: 'point_a_coords, point_b_coords'
  },
  '*INITIAL CONDITIONS': {
    name: '*INITIAL CONDITIONS',
    description: 'Prescribes initial values of state variables, stresses, velocities, or temperatures.',
    parameters: {
      'type': {
        description: 'Type of initial condition.',
        choices: ['STRESS', 'VELOCITY', 'TEMPERATURE', 'SOLUTION', 'HARDENING', 'RATIO'],
        required: true
      },
      'input': { description: 'External file containing initial condition data.' },
      'step': { description: 'Restart step to read conditions from.' },
      'inc': { description: 'Restart increment to read conditions from.' }
    },
    dataLineFormat: 'node_or_elset, values...'
  },
  '*TEMPERATURE': {
    name: '*TEMPERATURE',
    description: 'Prescribes predefined temperature field values at nodes for thermal-stress analysis.',
    parameters: {
      'file': { description: 'Name of the results file (.fil or .odb) supplying temperatures.' },
      'step': { description: 'Step in results file.' },
      'inc': { description: 'Increment in results file.' },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'node_or_nset, temperature_value'
  },
  '*CONDUCTIVITY': {
    name: '*CONDUCTIVITY',
    description: 'Defines thermal conductivity for heat transfer analyses.',
    parameters: {
      'type': { choices: ['ISOTROPIC', 'ORTHOTROPIC', 'ANISOTROPIC'], default: 'ISOTROPIC' }
    },
    dataLineFormat: 'conductivity_value, temperature'
  },
  '*SPECIFIC HEAT': {
    name: '*SPECIFIC HEAT',
    description: 'Defines specific heat per unit mass for transient thermal analyses.',
    parameters: {},
    dataLineFormat: 'specific_heat_value, temperature'
  },
  '*INELASTIC HEAT FRACTION': {
    name: '*INELASTIC HEAT FRACTION',
    description: 'Specifies the fraction of plastic work converted into heat (Taylor-Quinney coefficient, typically 0.9).',
    parameters: {},
    dataLineFormat: 'heat_fraction (default 0.9)'
  },
  '*CREEP': {
    name: '*CREEP',
    description: 'Specifies material viscoplastic creep laws (power law, hyperbolic sine, or user-defined).',
    parameters: {
      'law': { choices: ['STRAIN', 'TIME', 'HYPERBOLIC', 'USER'], default: 'STRAIN' }
    },
    dataLineFormat: 'A, n, m, temperature'
  },
  '*VISCOELASTIC': {
    name: '*VISCOELASTIC',
    description: 'Defines time-dependent linear viscoelasticity using Prony series representation.',
    parameters: {
      'time': { choices: ['PRONY', 'RELAXATION TEST DATA', 'CREEP TEST DATA', 'FREQUENCY'], default: 'PRONY' }
    },
    dataLineFormat: 'g_i, k_i, tau_i'
  },
  '*DAMAGE INITIATION': {
    name: '*DAMAGE INITIATION',
    description: 'Specifies ductile, shear, or cohesive damage initiation criteria for progressive damage failure models.',
    parameters: {
      'criterion': {
        choices: ['DUCTILE', 'SHEAR', 'FLUID CAVITATION', 'JOHNSON COOK', 'MAXS', 'MAXPE', 'QUADS', 'QUADPE', 'HASHIN'],
        required: true
      }
    },
    dataLineFormat: 'equivalent_plastic_strain_at_damage_initiation, stress_triaxiality, strain_rate'
  },
  '*DAMAGE EVOLUTION': {
    name: '*DAMAGE EVOLUTION',
    description: 'Specifies the material softening law (displacement- or energy-based) after damage initiation.',
    parameters: {
      'type': { choices: ['DISPLACEMENT', 'ENERGY'], default: 'DISPLACEMENT' },
      'softening': { choices: ['LINEAR', 'EXPONENTIAL', 'TABULAR'], default: 'LINEAR' }
    },
    dataLineFormat: 'fracture_energy_or_equivalent_displacement'
  },
  '*SURFACE BEHAVIOR': {
    name: '*SURFACE BEHAVIOR',
    description: 'Specifies the normal pressure-overclosure relationship for contact interactions.',
    parameters: {
      'pressure-overclosure': { choices: ['HARD', 'LINEAR', 'EXPONENTIAL', 'TABULAR', 'SCALE FACTOR'], default: 'HARD' }
    },
    dataLineFormat: 'stiffness / clearance parameters depending on formulation'
  },
  '*GAP CONDUCTANCE': {
    name: '*GAP CONDUCTANCE',
    description: 'Specifies thermal conductance across contacting surface interfaces.',
    parameters: {},
    dataLineFormat: 'conductance, clearance, contact_pressure'
  },
  '*COUPLING': {
    name: '*COUPLING',
    description: 'Defines kinematic or continuum coupling between a reference node and a surface or node set. Must end with *END COUPLING.',
    parameters: {
      'name': { description: 'Name of the coupling constraint.', required: true },
      'ref node': { description: 'Node number or node set of the reference node.', required: true },
      'surface': { description: 'Surface constrained to the reference node.', required: true }
    }
  },
  '*END COUPLING': {
    name: '*END COUPLING',
    description: 'Terminates a *COUPLING block.',
    parameters: {}
  },
  '*KINEMATIC COUPLING': {
    name: '*KINEMATIC COUPLING',
    description: 'Constrains nodes on a surface to the rigid body motion of a reference node.',
    parameters: {
      'ref node': { description: 'Node number or node set of reference node.', required: true }
    },
    dataLineFormat: 'surface_name, constrained_dof_first, constrained_dof_last'
  },
  '*DISTRIBUTING COUPLING': {
    name: '*DISTRIBUTING COUPLING',
    description: 'Distributes forces and moments from a reference node to a cloud of coupling nodes using weighting factors.',
    parameters: {
      'elset': { description: 'Target coupling element set.', required: true }
    },
    dataLineFormat: 'node_or_nset, weight'
  },
  '*RIGID BODY': {
    name: '*RIGID BODY',
    description: 'Constrains a collection of elements, nodes, or surfaces to move together as a rigid body governed by a reference node.',
    parameters: {
      'ref node': { description: 'Reference node controlling the rigid body motion.', required: true },
      'elset': { description: 'Element set included in rigid body.' },
      'nset': { description: 'Node set included in rigid body.' },
      'pin nset': { description: 'Nodes constrained in translation only.' },
      'tie nset': { description: 'Nodes constrained in both translation and rotation.' }
    }
  },
  '*CONNECTOR SECTION': {
    name: '*CONNECTOR SECTION',
    description: 'Defines connector kinematics (e.g. JOIN, HINGE, BEAM, AXIAL) and orientation for CONN3D2 elements.',
    parameters: {
      'elset': { description: 'Target connector element set.', required: true },
      'behavior': { description: 'Name of referenced *CONNECTOR BEHAVIOR.' }
    },
    dataLineFormat: 'connector_type (e.g. JOIN, REVOLUTE, BEAM, AXIAL, CARDAN)'
  },
  '*SPRING': {
    name: '*SPRING',
    description: 'Defines linear or nonlinear discrete spring elements.',
    parameters: {
      'elset': { description: 'Target spring element set.', required: true },
      'nonlinear': { description: 'Nonlinear force-displacement spring relationship.', type: 'flag' }
    },
    dataLineFormat: 'Line 1: degree_of_freedom\nLine 2: spring_stiffness, temperature'
  },
  '*DASHPOT': {
    name: '*DASHPOT',
    description: 'Defines discrete linear or nonlinear viscous dashpot elements.',
    parameters: {
      'elset': { description: 'Target dashpot element set.', required: true },
      'nonlinear': { type: 'flag' }
    },
    dataLineFormat: 'Line 1: degree_of_freedom\nLine 2: damping_coefficient, temperature'
  },
  '*MASS': {
    name: '*MASS',
    description: 'Defines point mass concentrated at nodes.',
    parameters: {
      'elset': { description: 'Target mass element set.', required: true }
    },
    dataLineFormat: 'mass_magnitude'
  },
  '*ROTARY INERTIA': {
    name: '*ROTARY INERTIA',
    description: 'Defines concentrated rotary inertia components (I11, I22, I33, I12, I13, I23) at nodes.',
    parameters: {
      'elset': { description: 'Target rotary inertia element set.', required: true }
    },
    dataLineFormat: 'I11, I22, I33, I12, I13, I23'
  },
  '*MPC': {
    name: '*MPC',
    description: 'Defines multi-point constraints (BEAM, TIE, LINK, PIN, SLIDER) between nodes.',
    parameters: {},
    dataLineFormat: 'mpc_type, node1, node2, node3...'
  },
  '*FILM': {
    name: '*FILM',
    description: 'Applies convective film surface boundary conditions for heat transfer analyses.',
    parameters: {
      'amplitude': { description: 'Name of referenced amplitude curve.' },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'surface_or_elset, face_id, sink_temperature, film_coefficient'
  },
  '*RADIATE': {
    name: '*RADIATE',
    description: 'Applies radiative surface boundary conditions with radiation to ambient sink temperature.',
    parameters: {
      'amplitude': { description: 'Name of referenced amplitude curve.' },
      'op': { choices: ['MOD', 'NEW'], default: 'MOD' }
    },
    dataLineFormat: 'surface_or_elset, face_id, sink_temperature, emissivity'
  },
  '*HEAT TRANSFER': {
    name: '*HEAT TRANSFER',
    description: 'Specifies a transient or steady-state thermal conduction heat transfer procedure.',
    parameters: {
      'steady state': { description: 'Steady-state heat transfer.', type: 'flag' },
      'deltmx': { description: 'Maximum allowable temperature change per increment for automatic time stepping.' }
    },
    dataLineFormat: 'initial_inc, time_period, min_inc, max_inc'
  },
  '*COUPLED TEMPERATURE-DISPLACEMENT': {
    name: '*COUPLED TEMPERATURE-DISPLACEMENT',
    description: 'Specifies a simultaneous fully coupled thermal-stress procedure.',
    parameters: {
      'steady state': { type: 'flag' },
      'deltmx': { description: 'Maximum allowable temperature change per increment.' }
    },
    dataLineFormat: 'initial_inc, time_period, min_inc, max_inc'
  },
  '*FIELD OUTPUT': {
    name: '*FIELD OUTPUT',
    description: 'Requests spatially distributed field output data written to the .odb file.',
    parameters: {
      'frequency': { description: 'Write field output every N increments.' },
      'time interval': { description: 'Write field output at specified time intervals.' }
    }
  },
  '*HISTORY OUTPUT': {
    name: '*HISTORY OUTPUT',
    description: 'Requests time-history point/element output data written to the .odb file.',
    parameters: {
      'frequency': { description: 'Write history output every N increments.' }
    }
  },
  '*NODE PRINT': {
    name: '*NODE PRINT',
    description: 'Requests tabular nodal data written to the printed output file (.dat).',
    parameters: {
      'nset': { description: 'Restricts output to node set.' },
      'frequency': { description: 'Print output every N increments.' },
      'summary': { choices: ['YES', 'NO'], default: 'YES' }
    },
    dataLineFormat: 'U, RF, CF, ...'
  },
  '*EL PRINT': {
    name: '*EL PRINT',
    description: 'Requests tabular element integration point data written to the printed output file (.dat).',
    parameters: {
      'elset': { description: 'Restricts output to element set.' },
      'frequency': { description: 'Print output every N increments.' },
      'position': { choices: ['INTEGRATION POINTS', 'CENTROIDAL', 'NODES', 'AVERAGED AT NODES'] }
    },
    dataLineFormat: 'S, E, PEEQ, ENER, ...'
  },
  '*NODE FILE': {
    name: '*NODE FILE',
    description: 'Writes nodal results to the binary results file (.fil) for postprocessing.',
    parameters: {
      'frequency': { description: 'Write results every N increments.' }
    },
    dataLineFormat: 'U, RF, CF, ...'
  },
  '*EL FILE': {
    name: '*EL FILE',
    description: 'Writes element results to the binary results file (.fil) for postprocessing.',
    parameters: {
      'frequency': { description: 'Write results every N increments.' }
    },
    dataLineFormat: 'S, E, ...'
  }
};

module.exports = { keywords };
