/*
 * requires JQuery, Twitter Bootstrap js and css
 */

window.__system__ = {};

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

Array.prototype.unique = function () {
    return this.filter(function (elem, index, arr) {
        return arr.indexOf(elem) == index;
    });
};

window.timestamp_ms = function () {
    let d = new Date();
    return d.getTime();
};

function reload_page() {
    window.location.reload();
}

function json_has_error(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return true;
    }
    return false;
}

(function (__system__) {
    function AsyncRequestLib() {
        this.request = function (method, endpoint, data, on_ajax_success, on_ajax_error) {
            $.ajax({
                type: method,
                url: endpoint,
                data: data,
                dataType: 'text', //will be parsed as json
                success: function (resp_str, textStatus, jqXHR) {
                    var error = '';
                    var resp_data = null;

                    if (json_has_error(resp_str)) {
                        //try to capture the json from the soup of texts
                        var m = /\{.+\}/g.exec(resp_str);

                        if (m) { //found some json
                            error = resp_str.replace(m[0], '');
                            alert(error);
                            resp_data = m[0];
                        } else { //no json, its all error texts
                            //no need to proceed as we wont be able to get even the response name
                            error = "Error: malformed response json. " + resp_json;
                            alert(error);
                        }
                    } else {
                        resp_data = resp_str;
                    }

                    var response = {
                        body: resp_str,
                        data: JSON.parse(resp_data),
                        error: error
                    };

                    on_ajax_success(jqXHR, response);

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    var error = 'AjaxError:' + textStatus + ':' + errorThrown;
                    on_ajax_error(jqXHR, {
                        body: [textStatus, errorThrown],
                        data: null,
                        error: errorThrown
                    });
                }
            });

        };
        this.get = function (endpoint, data, on_ajax_success, on_ajax_error) {
            this.request('get', endpoint, data, on_ajax_success, on_ajax_error);
        };
        this.post = function (endpoint, data, on_ajax_success, on_ajax_error) {
            this.request('post', endpoint, data, on_ajax_success, on_ajax_error);
        };
    }

    __system__['requests'] = new AsyncRequestLib();
}(window.__system__));

(function (__system__) {
    function ModalLib() {
        var _modal_msg_tpl = '<div class="modal" tabindex="-1" role="dialog">\n' +
            '  <div class="modal-dialog" role="document">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '          <span aria-hidden="true">&times;</span>\n' +
            '        </button>\n' +
            '      </div>\n' +
            '      <div class="modal-body">\n' +
            '        <p class="$class">$msg</p>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>';

        this.show = function (level, message, close_after_sec, on_closed) {
            var level_class = {
                success: 'text-success',
                error: 'text-danger'
            };
            _modal_msg_tpl.replace('$msg', message);
            _modal_msg_tpl.replace('$class', level_class[level]);
            var modal = $(_modal_msg_tpl).modal('show');
            modal.on('hidden.bs.modal', function () {
                on_closed();
            });
            if (close_after_sec) {
                setTimeout(function () {
                    modal.modal('hide');
                }, close_after_sec * 1000);
            } else {
                modal.modal('hide');
            }
        };
        this.success = function (message, close_after_sec, on_closed) {
            this.show('success', message, close_after_sec, on_closed);
        };
        this.error = function (message, close_after_ms, on_close) {
            this.show('error', message, close_after_ms, on_close);
        };
    }

    __system__.modal = new ModalLib();
}(window.__system__));

(function (__system__) {
    let get_items = function (needle, search_field, page, modelname, onsuccess) {
        $.ajax({
            type: 'get',
            url: "{% url 'home' %}",
            data: {needle: needle, search_field: search_field, page: page, model: modelname},
            dataType: 'json', //will be parsed as json
            success: function (resp) {
                onsuccess(resp);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn('{}: an error occured! {}'.format(textStatus, errorThrown));
            }
        });
    };

    let get_items2 = function (query, onsuccess) {
        $.ajax({
            type: 'get',
            url: "{% url 'home' %}",
            data: {
                needle: query.needle,
                search_field: query.search_field,
                page: query.page,
                model: query.model,
                filter: query.filter
            },
            dataType: 'json', //will be parsed as json
            success: function (resp) {
                onsuccess(resp);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn('{}: an error occured! {}'.format(textStatus, errorThrown));
            }
        });
    };

    let set_value = function (model, id, field, value, onajaxsuccess) {
        $.ajax({
            type: 'get',
            url: "{% url 'home' %}",
            data: {
                model: model,
                id: id,
                field: field,
                value: value
            },
            dataType: 'json', //will be parsed as json
            success: function (resp) {
                onajaxsuccess(resp);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.warn('{}: an error occured! {}'.format(textStatus, errorThrown));
            }
        });
    };

    __system__.get_items = get_items;
    __system__.get_items2 = get_items2;
    __system__.set_value = set_value;
}(window.__system__));

(function (__system__) {
    class SuperSelect extends React.Component {
        constructor(props) {
            super(props);
            this.messages = props.messages; // {nodata: '',}
            this.onChange = props.onChange;
            this.state = {
                cache: {
                    total_dropdown_list: props.items
                },

                dropdown_list: props.items,

                value: '',

                search_needle: '',

                show_dropdown: false
            };
            if (props.value) {
                const val = props.items.filter(item => item.value == props.value)[0];
                if (val) {
                    this.state.value = val.value;
                    this.state.search_needle = val.label;
                }
            }
        }

        load_data = () => {
            this.setState({
                cache: {
                    total_dropdown_list: []
                }
            });
        };

        on_searchbox_change = (event) => {
            let needle = event.target.value;
            let _this = this;
            this.setState({
                value: '',
                search_needle: needle
            });
            if (needle) {
                let itemss_suggestions = this.state.cache.total_dropdown_list.filter(item => item.label.toLowerCase().includes(needle.toLowerCase()));
                this.setState({dropdown_list: itemss_suggestions, show_dropdown: true});
            } else {
                this.setState({dropdown_list: _this.state.cache.total_dropdown_list, show_dropdown: true});
            }
            this.onChange('');
        };

        on_search_focus = (event) => {
            this.setState({show_dropdown: true});
        };

        on_search_blur = (event) => {
            this.setState({show_dropdown: false});
            if (!this.state.value && this.state.search_needle) {
                this.setState({search_needle: '', dropdown_list: this.state.cache.total_dropdown_list});
            }
        };

        on_searchbox_keyup = (event) => {

        };

        on_option_select = (event) => {
            let value = event.target.getAttribute('data-value');
            let label = event.target.getAttribute('data-label');
            this.setState({
                value: value,
                search_needle: label
            });
            this.onChange(value);
        };

        render() {
            let _this = this;

            let input_style = {
                width: '100%'
            };
            let suggestion_style = {
                maxHeight: '200px',
                position: 'relative',
            };

            // the dropdown
            let entry_style = {cursor: 'pointer'};

            let entries = this.state.dropdown_list.map(item => <li key={item.value}>
                <a onMouseDown={this.on_option_select} data-value={item.value} data-label={item.label}
                   style={entry_style} className="list-group-item list-group-item-action">{item.label}
                </a></li>);
            let style = {paddingLeft: 0, position: 'absolute', zIndex: '1000', listStyleType: 'none', width: '100%'};
            let dropdown = <ul style={style} className="list-group">{entries}</ul>;

            return <div>
                <div className="form-group" style={{marginBottom: 0}}>
                    {/*{this.state.value ? <span className="small">one selected</span> : ''}*/}
                    <input className="form-control" type="text" title="" style={input_style} value={this.state.search_needle}
                           onChange={this.on_searchbox_change} onFocus={this.on_search_focus} onBlurCapture={this.on_search_blur}/>
                </div>
                {this.state.dropdown_list.length ? <div style={suggestion_style}>{this.state.show_dropdown ? dropdown : ''}</div> :
                    <div>{this.messages.nodata}</div>}
            </div>;
        }
    }

    class CurrencyConversionInput extends React.Component {
        constructor(props) {
            super(props);

            let p = Object.assign({from_currency_id: '', to_currency_id: ''}, props);

            this.state = {
                cache: {
                    currency_list: []
                },
                props: p,
                currency_conversion: {
                    id: '',
                    from_currency: p.from_currency_id,
                    to_currency: p.to_currency_id,
                    conversion_factor: '',
                    show_form: false
                }
            };

            this.rate_hook = props.rate_hook;

            this.load_currency_list();
        }

        load_currency_list = () => {
            let _this = this;
            jQuery.ajax({
                type: 'get',
                url: '/currency_conversion/get_currency_list/',
                data: '',
                dataType: 'json',
                success: function (resp) {
                    _this.setState({
                        cache: {
                            currency_list: resp.data.currency_list
                        },
                        currency_conversion: (function () {
                            let cc = _this.state.currency_conversion;
                            if (resp.data.conversion_rate_latest) {
                                cc = Object.assign(cc, resp.data.conversion_rate_latest);
                            }
                            return cc;
                        }())
                    });
                    if (resp.data.conversion_rate_latest) {
                        _this.rate_hook(resp.data.conversion_rate_latest.id);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                }
            });
        };
        save = () => {
            let _this = this;
            jQuery.ajax({
                type: 'post',
                url: '/currency_conversion/save_rate/',
                data: this.state.currency_conversion,
                dataType: 'json',
                success: function (resp) {
                    if (resp.success) {
                        _this.setState({
                            currency_conversion: (function () {
                                let cc = _this.state.currency_conversion;
                                cc.id = resp.data.id;
                                return cc;
                            }())
                        });
                        _this.rate_hook(resp.data.id);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    let err = '{}: an error occurred! {}'.format(textStatus, errorThrown);
                }
            });
        };

        currencyconversion_set_from_currency = (event) => {
            if (this.state.props.hasOwnProperty('from_currency_id') && this.state.props.from_currency_id) {
                return false;
            }
            let _this = this;
            this.setState({
                currency_conversion: (function () {
                    let cc = _this.state.currency_conversion;
                    cc.from_currency = event.target.value;
                    return cc;
                }())
            });
            if (_this.state.currency_conversion.from_currency && _this.state.currency_conversion.to_currency && _this.state.currency_conversion.conversion_factor) {
                _this.save();
            }
        };
        currencyconversion_set_to_currency = (event) => {
            if (this.state.props.hasOwnProperty('to_currency_id') && this.state.props.to_currency_id) {
                return false;
            }
            let _this = this;
            this.setState({
                currency_conversion: (function () {
                    let cc = _this.state.currency_conversion;
                    cc.to_currency = event.target.value;
                    return cc;
                }())
            });
            if (_this.state.currency_conversion.from_currency && _this.state.currency_conversion.to_currency && _this.state.currency_conversion.conversion_factor) {
                _this.save();
            }
        };
        currencyconversion_set_conversion_factor = (event) => {
            let _this = this;
            this.setState({
                currency_conversion: (function () {
                    let cc = _this.state.currency_conversion;
                    cc.conversion_factor = event.target.value.trim();
                    return cc;
                }())
            });
            if (_this.state.currency_conversion.from_currency && _this.state.currency_conversion.to_currency && _this.state.currency_conversion.conversion_factor) {
                _this.save();
            }
        };

        showedit = () => {
            let _this = this;
            _this.setState({
                currency_conversion: (function () {
                    let cc = _this.state.currency_conversion;
                    cc.show_form = !cc.show_form;
                    return cc;
                }())
            });
        };

        render() {
            let _this = this;
            return <div className="mt-2 mb-2">
                {_this.state.currency_conversion.show_form ?
                    <div className="form-control">
                        <span>1 </span>
                        {_this.state.props.from_currency_id ?
                            _this.state.cache.currency_list.filter(c => c.id == _this.state.props.from_currency_id)[0].currency_name :
                            <select className="ml-1" onChange={_this.currencyconversion_set_from_currency}
                                    value={_this.state.currency_conversion.from_currency || ''}>
                                <option value="">--</option>
                                {_this.state.cache.currency_list.map(curr =>
                                    <option key={curr.id} value={curr.id}>{curr.currency_name}</option>
                                )}</select>}
                        =
                        <input type="text" className="form-control-sm" onChange={_this.currencyconversion_set_conversion_factor}
                               value={_this.state.currency_conversion.conversion_factor || ''}/>
                        {_this.state.props.to_currency_id ?
                            _this.state.cache.currency_list.filter(c => c.id == _this.state.props.to_currency_id)[0].currency_name :
                            <select className="" onChange={_this.currencyconversion_set_to_currency} value={_this.state.currency_conversion.to_currency || ''}>
                                <option value="">--</option>
                                {_this.state.cache.currency_list.filter(c => c.id != _this.state.currency_conversion.from_currency).map(curr =>
                                    <option key={curr.id} value={curr.id}>{curr.currency_name}</option>
                                )}</select>}
                    </div>
                    : ''}
                <div className="input-group">
                    <div className="input-group-prepend cursor-pointer" onClick={_this.showedit} title='edit'>
                        <span className="input-group-text">
                        <i className="fa fa-money-bill-alt"></i>
                        </span>
                    </div>
                    {(_this.state.currency_conversion.from_currency
                        && _this.state.currency_conversion.to_currency
                        && _this.state.currency_conversion.conversion_factor) ?
                        <div className="form-control">
                            1 <span>
                                                {_this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.from_currency)[0].code}
                                                </span>
                            <span className="mr-1 ml-1">=</span>
                            <span>{_this.state.currency_conversion.conversion_factor}</span>
                            <span className="ml-1">
                                                    {_this.state.cache.currency_list.filter(c => c.id == _this.state.currency_conversion.to_currency)[0].code}
                                                </span>
                        </div>
                        : <div className="text-danger form-control">currency conversion rate undefined</div>
                    }
                </div>
            </div>;
        }
    }

    window.SuperSelect = SuperSelect;
    window.CurrencyConversionInput = CurrencyConversionInput;
}(window.__system__));

function Statusicon(props) {
    switch (props.status) {
        case 'closed':
        case 'ended':
            return <span className={props.className}><i className="fa "></i></span>;
        case 'inactive':
        case 'backlog':
            return <span className={props.className}><i className="fa "></i></span>;
        case 'running':
        case 'working':
            return <span className={props.className}><i className="fa "></i></span>;
        case 'open':
            return <span className={props.className}><i className="fa "></i></span>;
    }
}

function UrlIcon() {
    return <i className="small fa fa-external-link-alt"></i>;
}

function PageLoading(props) {
    if (props.enabled) {
        return <div className="mx-auto">Page Loading</div>;
    } else {
        return "";
    }
}

function Stringshowmore(props) {
    let class_more = '';
    if (props.className) {
        class_more = props.className;
    } else {
        class_more = '';
    }
    if (props.full) {
        return <span className={class_more} title={props.full}>{props.short}</span>;
    } else {
        return <span className={class_more}>{props.short}</span>;
    }
}

function ShowMore(props) {
    let first_entry = props.entries[0];
    props.entries.shift();
    if (props.entries.length) {
        return <div>{first_entry.toString()} <a className="small"
                                                title={props.entries.map(entry => entry.toString()).join(',')}>{props.entries.length} more</a></div>;
    } else {
        return <div>{first_entry.toString()}</div>;
    }
}


window.modal_prompt = (options) => {
    options = Object.assign({
        input_label: '',
        input_type: '',
        on_confirm: ''
    }, options);

    let _modal_tpl = '<div class="modal" tabindex="-1" role="dialog">\n' +
        '  <div class="modal-dialog" role="document">\n' +
        '    <div class="modal-content">\n' +
        '      <div class="modal-header">\n' +
        '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '          <span aria-hidden="true">&times;</span>\n' +
        '        </button>\n' +
        '      </div>\n' +
        '      <div class="modal-body">\n' +
        '        <div class="form-group"><label>' + options.input_label + '</label><input type="' + options.input_type + '" class="form-control"/></div>' +
        '        <div class="form-group"><button type="button" class="btn btn-sm btn-primary" data-dismiss="modal" aria-label="Confirm">continue</button></div>' +
        '      </div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</div>';

    let modal = jQuery(_modal_tpl);
    modal.find('button').click(function (event) {
        options.on_confirm(modal.find('input').val());
    });

    modal.modal('show');
};

window.modal_alert = (options) => {
    let _modal_alert = function (options) {
        let _this = this;
        options = Object.assign({
            content_html: '',
        }, options);

        let _modal_tpl = '<div class="modal" tabindex="-1" role="dialog" data-backdrop="static">\n' +
            '  <div class="modal-dialog" role="document">\n' +
            '    <div class="modal-content">\n' +
            '      <div class="modal-header">\n' +
            '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
            '          <span aria-hidden="true">&times;</span>\n' +
            '        </button>\n' +
            '      </div>\n' +
            '      <div class="modal-body">\n' +
            options.content_html +
            '      ' +
            '      </div>\n' +
            '    <div class="modal-footer">' +
            '    <button type="button" class="small btn btn-info" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">Close</span></button>' +
            '</div>' +
            '</div>\n' +
            '  </div>\n' +
            '</div>';

        let modal = jQuery(_modal_tpl);
        modal.modal('show');

        modal.on('hide.bs.modal', function () {
            _this.upon_close();
        });

        this.append_html = (html_or_callable) => {
            let html = '';
            if (typeof html_or_callable == 'function') {
                html = html_or_callable();
            } else {
                html = html_or_callable;
            }
            modal.find('.modal-body').append(html);
        };

        this.upon_close = function () {
        };

        this.hide = () => {
            modal('hide');
        };
    };

    return new _modal_alert(options);
};