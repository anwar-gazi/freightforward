def int_to_words(num):
    d = {0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
         6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
         11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
         15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
         19: 'nineteen', 20: 'twenty',
         30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty',
         70: 'seventy', 80: 'eighty', 90: 'ninety'}
    k = 1000
    l = k * 100
    c = l * 100
    hc = c * 100  # hundred core
    tc = hc * 100  # thousand core

    assert (0 <= num)

    if num < 20:
        return d[num]

    if num < 100:
        if num % 10 == 0:
            return d[num]
        else:
            return d[num // 10 * 10] + '-' + d[num % 10]

    if num < k:
        if num % 100 == 0:
            return d[num // 100] + ' hundred'
        else:
            return d[num // 100] + ' hundred and ' + int_to_words(num % 100)

    if num < l:
        if num % k == 0:
            return int_to_words(num // k) + ' thousand'
        else:
            return int_to_words(num // k) + ' thousand, ' + int_to_words(num % k)

    if num < c:
        if num % l == 0:
            return int_to_words(num // l) + ' lakh'
        else:
            return int_to_words(num // l) + ' lakh, ' + int_to_words(num % l)

    if num < hc:
        if num % c == 0:
            return int_to_words(num // c) + ' core'
        else:
            return int_to_words(num // c) + ' core, ' + int_to_words(num % c)

    if num < tc:
        if num % hc == 0:
            return int_to_words(num // hc) + ' hundred'
        else:
            return int_to_words(num // hc) + ' hundred ' + int_to_words(num % hc)

    raise AssertionError('num is too large: %s' % str(num))


def saperate_float(value):
    number_dec = int(str(value - int(value))[2:4])
    return int(value), number_dec


def number_to_word_taka(number):
    taka, paisa = saperate_float(number)

    return '{} Taka and {} Paisa'.format(int_to_words(taka), int_to_words(paisa))
