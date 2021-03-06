import React from 'react';
import {
  useTheme,
  useMediaQuery,
  TextField,
  ListSubheader,
  makeStyles
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete'
import { VariableSizeList } from 'react-window';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const LISTBOX_PADDING = 8;

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING
    }
  })
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          key={itemCount}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.key}
  </ListSubheader>,
  params.children,
];

const useStyles = makeStyles({
  autocompleteRoot: {
    maxWidth: 400
  },
  listbox: {
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
  outlined: {
    padding: '8px 15px',
    paddingRight: 65,
    fontSize: 14,
    transform: 'translate(0px, 5px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(5px, -11px) scale(0.8)'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#192B5D'
    }
  },
  inputRoot: {
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child': {
      padding: 0
    },
    '&[class*="MuiOutlinedInput-root"]': {
      paddingLeft: 15,
      color: '#192B5D',
    },
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-endAdornment': {
      right: 15
    }
  },
  icon: {
    fontSize: '1.2rem',
    color: '#192B5D'
  }
});

const VirtualList = ({
  disabled,
  value,
  handleChangeValue,
  options,
  getOptionLabel
}) => {
  const classes = useStyles();

  return (
    <Autocomplete
      disabled={disabled}
      classes={{
        root: classes.autocompleteRoot,
        inputRoot: classes.inputRoot 
      }}
      value={value}
      getOptionLabel={getOptionLabel}
      disableListWrap
      ListboxComponent={ListboxComponent}
      renderGroup={renderGroup}
      popupIcon={<ExpandMoreIcon className={classes.icon}/>}
      options={options}
      onChange={(event, newValue) => handleChangeValue(newValue)}
      renderInput={(params) => (
        <TextField 
          {...params}
          variant="outlined"
          InputLabelProps={{
            classes: {
              outlined: classes.outlined,
            }
          }}
        />
      )}
    />
  )
}

export default React.memo(VirtualList);