import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  Leaf, Trash2, Map as MapIcon, MessagesSquare, MoreHorizontal, ChevronRight, LayoutDashboard,
  Radio, Route, Smartphone, HeartPulse, Users, Sprout, Wind, Landmark, HandHeart, Handshake, Mail, Phone,
} from 'lucide-react';

/**
 * LandingPage — public home page for Kijani Hub (Apple-inspired, cause first).
 * Six sections: hero, the problem, how it works, KijaniSense, why it matters, get involved.
 * Detailed prices live in the Marketplace; revenue figures live in the pitch deck.
 */

/** Founder portrait (embedded so no separate asset upload is needed) */
const FOUNDER_PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAJYAeADASIAAhEBAxEB/8QAHAAAAgIDAQEAAAAAAAAAAAAAAAECAwQGBwUI/8QARBAAAgEDAgQDBQYDBQcDBQAAAAECAwQRBSEGEjFBE1FxByJhgZEUMkKhscEjUmIVgpKy0SQzQ1NyouEWF9IlNGOD8P/EABkBAQEBAQEBAAAAAAAAAAAAAAABAgMEBf/EACkRAQEAAgICAgICAQQDAAAAAAABAhEDMRIhBEETUSIyFAVCUoFhcZH/2gAMAwEAAhEDEQA/AOrDwAHZyAAMBDwAwFgeAGQLAwAAABhdEAwAWB4GAUsBgYAGAwAAADABDAAABgAsBgYAIMDGBHAYJAQRwPAwGxHA8DwGBsLAYJYAbEcBglgBsRwGCQDYjgMEgGxHAYJANiOAwSAbEcBgkLA2FgMDAbCwLBIAI4DAwKEAwwAgGAFAABWTABgAAMgAAAAAGFABgYUAAAAAMBDAAABhgBDDAybCwPAAAAAEAAAAAAAADAAABgIBgAgGACAYAAAAAAAAAAAAAACAYAIBiwACGACAYAIBiLsIBgNjHGhDNMgYhgAwAgBiGFAAMKAAAAAGAhgAAMEhkAAAQADABAMAEAwAQDAAAAABiABiAAGIYBQAAAhgAAADAQDABAMAEAxAAAAAIYAAAAQAAAIBgAgGIDHABm2QCAZAAABTABhQAAAAAwAAAAGkCQyAAAIAYAAAMQAMQwEAAAAAAAAAAAAFAwAAABgIYAAAAAAAAAAAAAAAAAAAAAACGACAYAIBgAgGIAAACMYYhmmQMACgEAwoQxDQAADAAAAGCQwIAAAgBgAAAAAAABQAAAAAMIANU4y450vhilKnUqRr33LmFtF7+sn2RxbXeMuIOJbppXNWMH0oWzcYpfLr6ssiu9ajxZoOm8yu9Vtozi8OEZ80s+WFk8Gv7U+G6VbkhO6rLOHOFHb13aZxSjoGq3Ekpp00/MyZcJX0FzqqnLokhvCfbc4879O22HtH4YvJRh9udCcu1am44+fQ2Sz1CzvqaqWV1RrwazmnNSPmGvouqW3vOi5peSzgWm6zqOjXca1pWrWleP4k8fJruiyS9Viy49x9Ugc84J9pdpqyhaa06dpe55Y1M4p1Oy9H+R0MlmgDEMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEMAMZAIZpmGAAFAxDAYAAAMQ0AEhIZKAAAgYAAAAAAAABQADAQDEAHOvaN7QFo7npOjS8TUn7tSajnwdu3nL9DZ+NOIKXDmg172b/jSTp28cfeqNbfJdfkcY4XoTua1zq2oy8a6qzzzz3bb6sWyTdbwwuV1GLZcMXF9L7brFxJyqtznF7ybfmzY7Kws7KCja0VH492W1KkpMnSa6LOTycnNa+lxfHxxWKT8g3yEUs43LXBRin3OPnXfwil+hj3VjZ3cHC5oQmvTf6mTN4eP1IZisZGPJlKZcWNjWtS4RUIOtpNSSkt/Dm859Gbl7OOO61K5hoPEEqiqOSjb1qr3j/TJv8mYsJ4ez9TxOMrCNe0heU1irSfK3Hrg9vFzeXqvn83x5jN4u+IZo3ss4oet6R9iu55vbOKi23vUh0UvXszeTrfTxgAAgAAAABgAAAAAAAAAAAAAAIBgAgGACAYgAAAAAAAxRiGaZMBIYUIaENAMAAAGgACSAEBkAxDAAAAoAAAAAYAAAACGDA5B7abqVXVtMsINuNOk60o822XLC2+R4Oi5p2vI93nOcHq8bzd7xlqfiRUo0fDowyuiUU3v6s8x/7JSUaSzJ7RXmzlyXc09nBNe3opOeEZVvbprL29Txqt9dQhijQnKW2ZcraRXQncyTdzu29+bbB48pJN26e7HP36m20RpbZxlPyCdLmkvdxuY+k6hGjSVCaUl5t5Z6POnNNLC7HDzm/T0TG63VKtedbroUTs3h8qWMGRf3UqcHGGFLuatf19TdRu2qyx/TJ9fQ1hrL7Yztx+nrum6b3yiF1S+02tSg3hyXU820utUrKMbuzqYSw6mUvyMq2lUp1fCrL3W/dfkz04TV7efPLc6YXB1SvoHGtjKbmqVep4NTl/Fzbbr1wzvhxLX6H/053dPMatCcaia65izs9nXVzaULhdKtOM1n4rJ7Zdx8zlx8auAADmBiGAAAwAAAAAAAQwABAMQAADAQDABAAAAAACAYAYYxDNMwxiGFAxDAYCGAEkRGgJIBIZkAxDQAAAFAAMBDAAAAAABgDA4/r0E+JtYzn/7pvD9EYDp0/tUZTW0Ej1+KKbhxnqEHjFRwqL/Ajw7+phz5YtteR5fk78fT6PxtW+3p07+EswhyxivxMw69ajUquEmnPy7mr1LDV76FeM/EpwUW6MbeSeZduZ+Xoejw9YqwqXj1fTLSrGonyNSlmLeMYbeyWH039579Djhw4a3b7d8ubPepizpqVvWg5R91y2kjZLW6pKlDfdebNRlD+KqdGVZwc8whUlzci7Lme7+Z7lhQ91+Juzz8uOON9PTxZXKe19zWVxXlHGfdbweXe3ttY5VxXpRws4cuqJX9GcKvPBtpeRW3yaVVsqEadv43LJ3EFipzp5UnLu8pHTg8LPbHNc5/VkWGsWlxRlK2uYVOV4aUk/yMuNenctbR5+zNZs+HZRsJUrirbVpeGqdOvPadFczl7mPi+56Om0alpTVOdzK4S6VJLDOmWGEu8K5Y552azj19TjzaTcKTX+7be3wOn8P839g6dz/e+y08/wCFHLLybq6bOK6Sjj9TrWmRUNNtIRWFGhBL/Cj28d/i+d8ie2SMQzbzgAABgAAAAAAAAAAAAAgAAGIAAYgyAwEADEAAAAAGGAhmmTGRGgqQCGAxoQwAYhgMYkMyAAABgABQMQwAAAAAAABiNJ9o2v32mSsrLT41ua4jOpKVFpSxHtnsjOeUwm63x8d5MvGPJ9oFJU+LLat/PQgsfNo1mlBSupKfTmZbVuKl1Wp3FzOpUr7ObqS5njtuV+Jy1Xt3PHy8kzx3H0uLivHlqvSjpNDHPHMW+8ZtEvsNtSTnJ5a7yeTKsI+NQW6yviU3WFLw4Lnx18jyyXfb2eniyy7pygsZ2j5mwabZNQzvJvc1+5vaFhzTunySb2bTefTB6+jcTWtS1fMkmn+ODi8fM55zL6jpjcZdbWX1hJZnTbzjePmiixUKkHGpHKXdLp6oy7/XqEKMZ0aEqixv4a6lFCtG7jGvSpVKLcXlTjh/QYS69mVm/Q+zUVJ8kI+qRK4t4KmsxWepZb1eWoo1or17FuoVKbUVHfJ0x3tjOTTzJ0/9n5eqzv8AFG8afxlZKlb0Li2uaclCMZySUox2xnrnBpdP3lGMcZztkprxo6jaVak8tQ54ycW4yhNLpt8V1PVlz3jsjyT42PLvbssZKcVKLTi1lNd0SPB4GvPt3CemVnnmVFU5N9W4+63+R7x7cbuSvlZ4+OVx/QGIZWQAAAAAAAAAAIBAMQCAYCyGQGBHI8gMBZGAAAAMBABhjREZtkxiAipIZFDAZJERoBjEhgMaIjMhgAAMAAKAAAGAAAAAABoHtLpXVve6bqlOl4ttShOjVSfTm/8A78jfzE1axhqWm3NlVXu1qbj6Ps/rg58uHnhcXXg5Px8kyciuaEKMpcrk5SprZrZL4fU8a5qSjUUvTJ7Vejczrq1qRm7yUlT8GKeZT6JY8s9zy9WtKtrXqW9zFRq05OE0ntlM8XFx2YWV9Tlzlzlj0NOvJwpKMG+Z7JGS7uEJSpuSc08Sa8zydJrKNWjKXRPf1MDVZ32lRlXVs68eZ+9B5ab+Bjw36dJyam2wTxWmlyt+SfQsqW9SFNRlTp8suqlNPJj8PcP6vq9tC6q3FKhGajJQlmTUW8fJryNyocE3MrafjajzTi2klS2a+pqccnrbN5p3WtUbepUi4yjQcY9EpdPosBFzoyfKk/gnk2yvwXKlTiqOoTisNybprbCNG420q70alCVle+PczcUqbS7rLb32XxLeOX1snPL7xWV76nCvSfNhTmoTg/jsn6jrVJxdWMnvHoYGnWN7Vhb19RnGVXKnKMFtFJ56+Zl3ElOrJr8Us4XkMcZKZZ2z2utpJRi5Z6FHgyr1NStqEZcl5Upxp52zOUktvzNg4Z0KOsRrxnVlR8OlmE478s29m13Wz27mw6Pwg7a8oXN/UoTlQlzwjSi8c3nv0Omfx7yWVyx+Tjx42fbYNI0+lpWm29hbpKnQgor4vu/qZgDPbJqafKttu6BDAIAAAAAEAxAIAACLYDbFkTFkIeQyRyGS6EgI5GmNCQ0RGRUgIjAYAAGEhiA2iQCGQMaIkgGNCBASAQwGhiQyBgAEAMQwoAAABiABgAAAAAByrOcLPn3OXe0+w8DVFcxXuXEFL+8tn+x1I1j2g6d9t0GVWKzO2lz7fyvZ/s/kTKbmnTiy8cnHKFV06uM4TNk543ltGWPw4kjVq0XCo0+q6M9PTbmVJYb2Z4ssX08M2VaSjZV+WbcYN7STax9DcLfU50qahSvZyi1v7zaefU1z7LTu4Jt4fmiE9Kq044hczS8so5+f7enHH/uNoudQq3UWql7KK7JSwvI8CdvCtUbXvYf3n3IWljUbXiXEsfFIzMwpbQ+rJ5fosn/Su8caNthYy1ueRD36jk3uzNvKjm3lmLbrmqL1O2GP082ef26VwJb+FpM6uN6tTC9IrH65NlPM4ZpqnoVmksc0Ob6ts9M9k6fKzu8qBiQysgBAAwEAAACAAATATEwZFlQNgICgAAABiACSYyI0QSAQyKYxIYGCMQ0bQxiQ0QAxDQEgEhgNDQhgMaIkkShgIZFAAADAQwAAAAGIAGAAAym7oq4ta1CXSpTlH6otGuqA+er3HiSg1icW0Ydxd+BR54rmw90errtKP9rXioyjKKrT5XF5TWXhrzNa1KE5U5Qist9UcLZb7e/VmO49/T9ep+F7zWyWV3PWlr1BW3JJSTXTCy2crm61ConunnGUEryvN806jy/Nkvx5Uny8pHU7bXraceSTaa3a6fmVXet262pyitsvfoczV7cRjnm+BlaZUrXFZKbck3nGR+CQ/wAvK+m+V7+LwovLe7LLeT5crrI8uytW2m8+jPYglTkib16jpJb7rs2kR5NKs4+VCH+VGWc59nHGFe51S+4b1p+HdW9RuzlPZzpdVH4tJprzXodGPS+fl2AAAyAAQDAAABAAARY2IBMiNkSxAIAKAYgAYCGADQhgNDEhmQyREaCsIYhm0NDREYDGhDIGhiQwAYhgMYkMgYyOR5IGAsjCgAAAAAAYCABgIYDyadxhq32rWbPha3qypq4pyuNQqQliULeK3gn2cntny9TO4s4u0/hyylOdWnXu5e7StoTTlKX9WOiXc5d7PdZudV9pVa+v6nPWurWqm8YSxy4SXZYRrV1tvDXlNse7lQr3k6loqaoOTVNUliKitkkvLYhc2dO4p/xItS7SXU2fi/hpaPdyv7KCVhcTzKEVhUZvt/0t9PJ7eR5cKcZw8meDltlfW48ZlGq1dKjUbjKPN5NFU+FpShzQlJY6KUcnu1VKhUe3R9D3rGvQuLeFSKxJLEo57mPz3FP8bHPtpNlwvUe9SLkl02wj1rPR6dv1pxT+C3NklcuT8OMUkuuCM4JpbLPwRb8jKz2uPxcMb6YNOkoLZbiqRaTk03jt5/A9KNulHMlj1Ng4V0B3VenqV1HFtTfNQg1vUl/M/gu3n1GFuV1Gs5Mcd1z/ANotCWlcR6FVy4XUtOgqzWzzGTS6d0tvkbnwP7R6V04adr9WNO4WI07t7Rn5Kfk/j088Gi+1q8V5xvVjB5jaUYUfn95/mzUXP3s53PqY47x1XxObPXJX1hCSnHmhJSj5xeUSPlm01a/saiq2F5Xt6i6ulUcf0N/4X9quoWrVHXqTvaPatTxGrH17S/JkvHWJyR2cTNf0fjTQNXnGnbX8YVpdKVdeHLPlvt+ZsBizTewAAQAAACYmNkWAmRY2RZUACAoYCABgAAMAACSGRRIlDGhDRFYQxAbQxiGAwBAQNEiIwGMQASAQwGAgAYZFkMkEgI5DI0JZDJ5+q6xp+j0fG1K7pW8eyk/el6LqzQtZ9rVrSUoaRYzqy6KrcPlj/hW/5osxtS2Tt0z0PG1bivQ9I5o3uo0VUX/Cpvnn9F+5xLXOPNe1mDpV7x0qL60rdeHF+uN382avOpJ9zpOP9sXkk6di1P2v2lKTjpum1KuOk69Tkz8ln9TSOIPaJr+sqdJ3KtLaWzpWvu5Xk5dX9TT5PA5LbBqYSM/kyqxVsuUn1Pf9ntf7Pxfp1XOFKbpv0ksGsye2D0dCqujqNtVi8OFSMl8mL7b4rrKPpl0qVzbzoXFONSlUi4zhJZTT6o5/rfDNzonPWpc1xp6eVNbzorymu6X831wb9ZzVSjGae0kmvmZsd44e6PFnhMpqvqYcl476cRu4KWJZUk12Kra2lGXNTquKfVNG/wDE/BHjRndaEo06v3pWreITf9L/AAv4dPQ0Sjd+DUnRuaU6Vak+WpTnHEovyaPDycdwe/j5Mc+nq29GCScpyk/gsGRFxUtlj4nnf2hTUfc2Xdnp8M6Pc8SVnPMqOmwlipVW0qr7xj+7OWGFzuo6Z544Tderw3pP9s13WrJ/YKUsN/8AOkvwr+ld/p5m9V5wt7eU3iMKcW35JJErW2o2lvToW9ONOlTiowhFbJGse0rVv7K4WvJxlirVj4UPV7H0uLjmOpHy+Tl/Jlu9ODaxdPUdVvb19a9eU/lnY85svSwkvgV1I9Wl6n0NPkZ5btqtPsTp1Gts7rqUznGm/fzntFdWEFOTc5LlytkJWbHoUq7ybNpPHWvaVKKo386tKKwqNx/Ehj57r5M06E+VlsXlZLZL2TKx2DTfa5SlCMdT0ual3nbVE1/hl/qbVYce8NXyXLqUKEn+C4i6b+r2/M+dozafUui31MXjxrU5K+o6Fejc01UtqtOtB9JU5qS+qLMny/a311YVlUtLirQn2lSm4v8AI23TPaXxDbW0qcq9K6z9ypcU+aS+axn5mLxX6bnJHchM1TgTi/8A9S0KtK6pwpXtFKUowzyzj/Ms9N+q+KNrZzssuq6S7RZFkiLKEAAAAAAAxDABiQwGiRFEiUMaEhoisIAA2hjEMBgIZA0MiMCQCGADyIAGAgAAyI032qa5PSOGpUqE3CveT8KMk8NRxmT+mF8yybqW6Zmp8fcO6eriLvlWrUdvCpRb55fyqXT8znur+1bVbtShYU6VjF9HD35/4n+yOc1aknDrsmmKL7nWYSOOXJWbfahc31xKvd16larN7zqScm/mzFcmJ7gtzbnswwMjOT7ICNRJpplMKc6Typvk/lZfSeW0+o63kSzftqXXpVNe9kut6ro5qxWXBc6XnjcqksxLLdc7cf5k19TLePcfSnCl1C+0CwuqMlKFSjFpo9yG3U5J7E9cqUKc+HNQzFpupaSl3/mh+6+Z1mU1GLbaSSy23hJfE8tfUvtc5YNU4tpcN3FaEtSuaFHUIYjTcZLxN+ilHuvU0jjv2qLxZ6Zw1VeE8Vb9Lr8Kf/y+nmaAuS5l4lReJJ7uU/ebfqzWPF5z25Zc04r/AOXXLfg2xd7D7dqlF2jw40o+45/Byy/9TodrRo21GFC3pxpUoR5YQisJLyR8vzt6Sin4ceV74Ns4S9o15w7UpWmoSqXumZUXCUuarRT7wb6pfyv5E/BOOel/yfzXVd5k8I4z7Z9U8e8tdPhL3YNyks+X/l/kdYp6la3Wlx1C0rRrW04c8Jx7/D4P4HzxxneO94ku5t5VNqn81u/zbNcU/knL/Hjv/wAeKiM/u48yRCT7nqfMVRhGM5PlTz3Lk1jYh32K23Os1F+7T2+Y6Ozkve2LIPEcCwOK3Kiajkui8IjBbEuXfcCmtNqL65k+VGRSXLFJdEY9TE7qEe0U5MyYryIrYOC9aloev2123/BcuSsvOEtn9OvyPoNNNZTyn0a7ny9GXLJM+guBtVp6vwzZ1YyzUowVGqs7qUVj81h/M5cs+3bjv091iZNoizk6IMBiKAAAAGAAAwABokRRIlDQ0JDRFYIxDNoYCGAxkRkDGIAGMQAMYshkBiYhAM4x7bNSjX1i0sKcsq1otzS7Sm8/ol9Tr1/d0rCyuLyu8UqFOVSfolk+Y9a1CtqWoXF5cSbq16jnL1bN4T7YzvpjcvNTa+AovKQU90Rjtt5PB1jhVvYERbyhx2Khtie4dx4TAqjmNVfEuqbsqqrCyu25YnmOSNdovoOg+WafkNijtJMjUdms9GowlbXlFKE5ctWEl1TaybHxLp9fiLQZW0a0qSazKEHhVH5S818DyOGK/wBs4Y02rlNqgoP1j7v7G36ViVDl8jzZ9vsTP+MyjicfZne16deUqio1En4akvvPsn5epqdlGpQnWta8ZRq0m1KDW6aeGj6XvLdNZSOI+0uwjpnFtO7gnGleUuao+3Mnhv57GuO6rz/JxmePlHjxo1ru6s9Ms6bnc3MlGKXTc6zpHs+0u1tqVG6pxrzjJSqVGt5vD/LfZfA1L2XWkK3E1xqElmNta8sM9pSeOnpk7AouNOD3y22/oTlyty018bGY4eX3Xj1adHS9Juoxap21OnKpNJbYis/sfPkqkq1Sdao8zqyc5P4t5O1e1C++xcI3FOP37ucaGz7N5f5J/U4o2deKam3H5me7ITISJCktjq8CqcuSEp46dF5vsOjDkppN5ff1ITzOtGC6Q95+r6GTGG24hf0rZOmmxuG5akorYqGo4JEVIHLYDHoe9XrTfnyr5GWuhi2O9Lm/mk2ZPckU+pvfsi1iVnr0tPqS/g3sOVJ9qkd4v6ZXzNERmaNdSsNVtLuDw6NaM/o0xZuaaxuq+lhSGmpLmj917r0Ezyx6EWRJMiygAAAYAADAAAaJEUSJQxoRIivPGIDaJAIYDAQwGMiMgYCGAAAZAAYhMDR/a/qn2Hhb7LCWKl7VVP8AuR96X7HB6ksyOj+2vUHW1+1sU/dtrdSa/qm8/okc3xlnSdOWV9p020hPacl8xJNMKjaqRb7rBv6Y+1hIitx9DTJjWSKZJMBS3TI05e7juthyKoPlqteZmrFwIlgj3DTq/spu1V0i8s2/eoVlUS/pkv8AWL+p0TSZcsmmcT9muofYuJKNKcsU7uLoS9XvH81+Z2mx92XzOPJPb6HDlvjejdTwsfA+feNL13nG2pxnPxIUqihTT3UVFJYXzz+Z3fXLyGn6fXvqn3LelKo/ksnzTa1pXF/VrVXzTqNym3vu3l/qOPtnnusNN39nV3G140tqUmuS6ozp4z+L7y29Udtu57QUessnzfb3ctP1fT7+PW3rwm/RNZPomrWjP7PKDzCcW0/hjJOWfya+Pd4f+nMfbNdrGlWEX3nXl+UV+5zKSNt9qF59q4wuKaeY2tKFFeuOZ/nI1JnfCaxjyfIy3nSwQlJKLb6Lcn5lNb3nCmvxPL9EacO1lvT5Y80vvyeWXNkES7lQ+wgfqRb3CJ5SRXXny285d1FhOWIldy/4MI95SS/cUnbIt4ctKK8lgswRi8LA8kVJdBrqRzsSXVBX0fw7c/a9A024by6lrTb9eVJ/oZ7ZrXs7uFX4P0/fLpKVJ/KT/Zo2PJ5rNV6DbEABQAAAwQhgMAABokiKJEoZIiMisABDNoBiACQEcjAYxZABjEBAwEBQAxDj95eoHzn7R7v7XxnqtTOVGt4cfSKUf2Nbh0MzXq32jWr+tnPPc1JZ9ZMw4I6RxpvKIV37il5SLJNx6rYpqtShJeaLUna+DykyUim1nzU15mR1LLuJZqoZHkjJC6A0bZRUeGmuqZaV1N0ZvTUZVOSnTTQpLuU2U+sH6oyGjUu4lmqus6s6NWFWk+WpCSnF+TTyj6K0a8hqOn2t9S+7XpqePJvqvk8o+caTwdh9kmpO50i4sJyzK1q80F35J7/5k/qZ5J629PxstWxm+1/UPsnBlSknid1VhRXpnmf5ROH6bPluN1nPc6T7b75Slpunp7pyrS+mF+5zfTowdTvzfqZ44fJvvT0dQgnQzjsdw4G1KOp8KaXdTf8Au6bhUb84rD/I4ldr/Z5eht/BGs/ZfZXrWJ4nb1atKD+NSKS/zMck3pr4uWtxp2qXj1DVLy9lu7ivOp8m21+WDEYo7LYG8s7PHld3ZdWVUvfrTmui92JOpN06cpR+90j6sdGPJCMfIfbP0tihvYjkU5bFRGc2uxCD5n1IVJN4S8y2kkvVgE+qRTXkncUo9kmy+a95GFOebtp9o4JkuMZ0Jp7FqZg05qLWWkKvc7uFOWPOX+gt0sjMlXhB4by/JFkai5VJ7PsefTh4aUpp8z6Q6t+pk0YSm8z6+S7CDsvsau51dGvbeWXGlXjOP96O/wDlOgZOOex/Va0OJLnTKe9rUoNz+FSO+fo8fM7EcM+3fHpICI8mWkgEMAGIAGMQ0AxoiMCQyGSRBgDEBpTGIAhgIYDAQAMZEYDyGRZFkB5MDiC5dpoOo3MJqEqVtUlGTeMPlePzM40z2u1q1Lgq4VHOKlanCbX8uW/1SE7SuCSzKWX1GsojGfNuSUl0Okcatg01hlFxT5ctE3JRI1KsWmmW60TbGtp8snH4mfGWx5SmlV26GfTllGML9N5z7XdQcQh1Jdjq5bVtFU11L2VziZsalYqk4VFJdmejzc8U10aPPqrDMiyqZi4N7rdehnG6um8pubZC2Zt/s11RabxTbKpLFK7Tt5+W/wB1/wCJL6moNdy2lOUJKUJOMovMWuzXc6a3NM4ZeOUrYfazdu444r0s5VCjCGH27v8AU8DTocrwsZb7mNxFqs9W4kub+quWdeUXJfHlSf5mfZpeGmuvmc8HTmu8tsi/ko2k29sI87R9TlT0K90vf+PdUq/wxGM0/wA3H6GRqtVKzkk8N7Hk6fDCb82WzeUZxy8ZbHor8xAugLZNvp3Ojiqn71eMe0PefqXZRjW2ZupNt+8y59cIQqUnghOWF2E/VlVVqO7ZUJP+IsvL+BdHd+8jHpN83Nhr1LoycsYwiSrUm/exskl2PNqVMXE332SXmehNOKcm10PIi27iU89Hsc+S603xze18ueLzP7/ZeRmWVvyJVKnXtnsU0JRhF1KiST+6u7LJyq1VzVH4VPtzbDGTtbb0yZ1qUW1H3pPr/wCScatSUeSmkqkum2FFeZTbUXJJ004w/nkt36LsZtKMYYUVg3PbDpvsV0mlRp3+oLDlHFCGXvv70m/Xb8zqByH2TahO312Vi3/CuqMtv6o+8n+q+Z105Z9u+PRgAGWjGiI0QSAAAYyJIAAAABiADCGICqYAADAACAAABgIAGAgAZoPtl1KvZ8LRtLZZle1eSe2fciuZpfPBvdSpClTlUqSUYQTlKT6JLds4X7ReMocTVqNrZ0uS1tpylCcvvVG1jL8lt0LjN1nK6jQoVJSa5o7vrtuXulLrF/JkJuqn0Qo15RfvI1NTtj3ek5xbW6aMWrTeNjPjVUoe69yqdTDxKKZcpKmNsry2mmZlCeyIXeFFShFLzaIUJefmcZ/Gut/lHowkWc2TGpyyi6LPRK4WJ9Qe4LcJFRj1YZKISdOakuxmNZRjVoYeTnlPt0xy+mfFqUU87NbDjs8GJZVP+G/VGZy9zpLuMWarztRhyXEKq6Pr6nqW1TE4xUvdxv8AqY15S8S3ku63RPTqnNbqT/A8dNzEmsmrdw9XllKC6ddn1K7OHLTivmK7fPN7YLaawkjUnvaW+lrKruTjSUF1m8Fq3ZjSl4t298xp7L1LWZ+1tGLgnH6PJJ5BbCbKiEorO+X8yuclHdJL5FkpYMOtUzLCJbpZN1bS9+TbL47TwU0No5Jp75LOkvZXlRRpvzwefSp8j3SlN747Ild1XKrGKeyZZarmnnsjjb5ZOsnjiy6FKNOCqTfPVl0ys49EW07dc/iXD5pdovoiUGqcMvr2CGW+aZ11HPdZCln4BCWZYXYpr1VCKx1Y7dOMOaXVmkbbwDXVHizS5N4/j8nykmv3O6I+bdNu5WmoULqL3pVYz+jTPpKMlNKcXmMlzJ/B7o48nbvhfRjEBhsxoQ0AxiGQAxDQDAQwAAADCAQyhgIApjEADEAAMCI8gMBZDIGpe1LU3pvB114cuWpcyjbxx1xJ5l+SZ88uck85Ox+3K4as9Jtc7SqVKrXokl+rOQSgmak9OeVTpVFPZ7MnKmpLdGP4bT2Mui8xxI3jd+q5Wa9xiypzpSzDdeRPMa0fj3Rkyi8bboolTWeaOz8hcddLMt9sScWsrsUUtm0Z9aDnHKXvL8zz4PE2cc5qu2F3GVTlgvjLcxIsthI1jkzlizYPYGV0pk8naVxsPsRlHmRPrsSccdWgjAlGVKalHqnsz0aM1VhzLv28imdNSytiqhJ0KvLL7sjMnjXTflGc+hgUZO3u6lL8Mltseh22PO1KPLKnWX4XhjPraYd6Xffmkt98l/QotsSfOvLYu7lxSnUn4VGU/JbevYptYuNPL6vdkbh+JVhRXRbyL0sLoJ7pfUSfQhKXUbeOxVORq1JFdWWEzGp5nPI7me2F1ZO3ict7rp1GTHaOCFSXLBk5bIxLueI4N5XUYxm6w5yzUyenZwwllddzzaEeeqvJHp05qFSCfR7HLi7268n6X5zLml0XQjK46xjuQrPmqcvSKClTdaXLFYgurO1rjIvo0JTl4lV58kZaSZW59ohCUm0sFReoJbeZ9CcKXP2zhnS7hvLnawT9UsP9D55Um+p3P2aVfF4Nsk/+HKpD6Tb/AHMcnTrx9toAAOTqYIAAkgQhkDAAAYCGAwEMDAGIZVMBDAAAAAAAIAAAABZBgce9tdfxNcsbf/lWvN85Sf8AojmqW5u/teuFLjKrD/l0KUf+3P7mmbM6Tpyz7VuTXUspyTFKOSCXLIdVnuMhyayR54ye+zJZzH9Smcd8o1akiyWFFttYRRb17ahK7lWoqpGvbypwfenPZqS+mPRshXbdGSZg5bTXwOXJlt148de1qeUSTwyuD2J5MNrYzaZdGpkxScZG5WbGVGZZkxoyLovKNyudixPcjVSqJpoExt7GqzDtqjacJv3o/mRv1zW88+WSuo3CSqR6rr8UF5UUrdNdJGbfVjUnuVLTU/syb+RktqEHKXRELaHh0KcfgRvHzctGHfdmp6xS+8ldonKUqsusmZLIwiopJdhtlk1Gbd3aM2kjGqS6llSW+xjVZbGMq3jFL96eTNo7GHSWcszYbIzgvInLZHnXct8GbUmkedcSzIcl9Lxz2stVhZ8zJm1JYZj0dooyqFF1I873WdkTCetLlfe0aVOU3vL3fM9SnTUaSUcJGDKFX8KQo3FeltKOYnWajlZa9GMV1RNIxre7hU2ezMpR5lszW9s6LJ2n2S1OfhNx/kuqi+qizi0abT36HX/Y7POhX0O0bpP6wX+hnPp04+2+gIZxdjQCGAxiQEEgEhgAAADAQwMAZFDKRIBAAwFkeQABZEBJAxZAAB9ABfeXqEfPPtNr/aeN9VlF5UKkaf8Ahika1Sk0+VnqcTvPEuq5fN/tlXfz95nmqO+TcjnlVyWSMoZCMkurJeJHzN+mPaMMxeOzIymudxXVFmYvuY1eLUnNEvqLPdSrRXI32wZnDmm+PpXEF9OKcLKy2bX451IxX5cx49WpUl7sunkjp1vpS0r2JX93LHjalOFWT/p8RRivyb+Zxyu3fCactgS6EIEsmYtSyNMh8wz8SoujMup1PiYfoNScSzLSWbeinlEjHtlVqLMKc5LzUWZGJR2kmn5NYOsu3KzSqq2k8mMpbqPZPKMmt90xoR5p4M5dt49PTVROOWKnDmfiS+8/yMZZ5oU/PdmXlnSXbGUN7FNSXkSnIx5yYtZkRnIoqvJZIpn1OWVdcYtpLES+TwiuntD5hVexqeozfdV1ZmJN5ZZUZUzllduuM0v5sQXoKF1Vi8LGPLBBPMBU1ltk3fo1PtlwvJ596mn6Myad1RnhSbj8JLJiRj7ueV488E40VPujrjcnPKYsqdtzLxKTWfgy2yumpeHU2fxMHwqtH3qcnH9CyFXx5JTSjVz7s10fqal9sWPZlNrbz6HV/Y1LOk6kn2uIf5DkFpUdSDp1E41IvGH2Z1r2MTzZarDyrUnj+7L/AENZ/wBVw7dHAQzi7GMQwAYhgMYgIGAAADEAHnjyRGUSyAkMAAMiyAwEAQDyRACWRpqLTfRbshk8jjDVXo3DOoX0MeJCly08/wA8vdX65+Q0PnjUq/j391XfWrWnN/NtmFKpJvEETkm3u/8AyCSRv257inw5y+9JiVupP3ZS9S6TT2TLItKOIRz8exPGL5ViOnWp/clzfBk6dw88tWOPUv2z71SC+YSpxns8SXwGv0eX7VzpRffZnW68Iah7D7G2p1FGUqlOg3LbDjVbePPY5HUTpQ65WdjZdL1G91qtY6baU6kLGwoqNODllKbeZ1JfGTz6LCOXNl442vR8fHyyke/pPCWlW1JKrbq5qd51N8+i6Hpx0LTaf3NPt0/hSWxnW9CdOCTkm0uplxilHqtz42XLnbvb7+PDhJqYvK/s60gtqEF6QRV/YtG7+9b0+T4wR7Et3yxa6mTBckcGfOxq4Y36a5W4Z0pRzUtKc2v6EjWNStNJ8XksLK3UY9aiWcv4HRZwjcc0KizTkmpej2ZzipSVvXrUFlOlNww3l7PB9L/T555XyvT5X+pX8eE8Z2VOnFdiFehCpFqSyvIsXUshSqVpctKOZM+xdafBx3apseDLrUrJV7a9oZcpLlnBrGH5o2DTPY7qlxp9teLU7SM61NTdOVOfu5+K6/Q9Dh5ujov8HfmcpRl5rz/I7Bp1NQ060hjHLQgsf3UfKx5sryZT6j7mXx8MePG691xD/wBoOIKUpTVzp9Vt9qko/rEwLv2bcVUlLl06FVL/AJVeDz9Wj6G5SFSGYSXwO85bHC8ONfJlShUhJxkkmnh79CDoy+B6NxHFeou/O/1K1HyPT4x4LdVgfZpN9UhrT8vLqfkZzi10ItuL3J4Q86xnatRxGab8mjGqU6nNyqDyejJPGYPJCnWjKXLUWH2FxhMqwadm5zxVyl8DJVrRhjlpxf8A1LJmeDyrK3Bx6MTCQudrGrWlBwxKmo5/FFYaMT+zpxTdOUZxzs+h7Eoxa+Bh1oVLaXi0d4/iiMsZ2syrCi6tGWJxePiZlKllqrRWfOHn6fEnGdG6hs0pd0y+3puDwuiEiWsOcZSXNQqSXwl5+RR4s6VROtQjlP7yRm14+BeQn/w6z5ZLyl2ZbVpKScZIa2b0hTlG45alN+/jHqjqfsZqvxtVg005U6Un6pyX7nIYJ21fCzyN7HYPY1byf9p3cnlONOmvq3+yJlf4rjP5OmgCA5O5okRGgGNCABjEMgYCGAAAAeamPJECokPJHIwGMQAMQAAAAABpntceOCqzzsrmjn47s3I0v2vJvgiv8Lii39WWDhTksvLHFKfQqxzPYnOrGjDHVl3+2NfpY4xpxbay+yMepzzlicnJ/wAq2UfUg1Uq+9NtLsl3Mq2pqVTkSXJT3l8Zf+Cf2X+quFnneSST74/RF0bejFNRhulnOTJn8OpCMlB/F9Wb8ZGPK1lcL6Vaarr9pR1K9pWthGXiV5154XJHdxT830Nvr0NF4Y1OdfRNXtb+yuqr/g02+egvJvo12TNLl2SIyl73K+nY58nDjnLK78XPePKWOs0a1K5jGrSqQcX15ZJhOva0niVaCflk5VRrVaDzSqSg/wCl4MuGrXcfvOE/+qP+h87P4Gc/rdvqYf6nhf7TTov2qjzZjUXyMyjXU6be+fic8teIJU8eJbxaXeMv9T27fimylTSm5wflKP7o8vJ8bmx/2vVh8zhz/wBzbac1GGZPY5rxXRu6PElxWt1Hwq6hOKnJRUnjDxl9Vjt5mwVeJ7OpS5Y1lDHmzU+KtWoX9vSowqRn4dTmW+XusM6fD/Jhybscvm3jz4uzqXs1CK+xXVOp3bjmLfr0MzhWwuNc8SvdVJRtFPk8KG3jS64b8umV3NLo3M6M04SlHD35ZNZOq8Ka1bytYwpwhGVFL3IJJb98fE9/yubk8P4vn/C4OO8n8mxzt1ZWMoy+9JYxHsvI6jbR5aFKPlTivyONXmqyrVY5SUU+52iH3Y48keX4uNku3v8AmWetGQqvEGTKrmXLRk/I9bwzt8v30OW9uIpdKs1/3MrWEZ/EVLwNf1Kl/JdVFj+8zzpJHvj5mfrKlUl5MolXceqyvQtaRXUin1QZODjNc1J+qKq9LnXNHaS6mJNzt6mYvYzre4p3C3eJozLv1WrNe4hbXbh7lUzYpSWYvKMavbKos4xLzRTRqzoT5J5wXdnZqX3GfUj7pUpJrDeS5SVSOUUVFySz2KywLiDt63PDaLM2jWyska0VVpsoo5jmJmTVat3GXWxXoygvvL3o+qJW1ZVaSb+9gw3VdOpkti3Cp4kPuT39H3L9p9JXdPmjnutzs3sYw+F7if4ndtP5Rjj9TkUsSj06o7F7HreVHhGVSSwq13UlH4pKMf1TJn01h23kAA4u4JIiNASAQwGMiMgYxAAwAAPLGRGaQx5EAEgEBBIBAAAAAJmq+1Gl4vAup/0KnP6TRtR4/GFt9s4V1a3W7naTx6pZ/YsHzY34cM92VU6bqT5pE67yl8Rp8tMn2n0mstSkvwrEfUut/wCDSUe/VmPSzjPmXNmp+2as53J7sjW2iirmeQqTysF2mmdDeKl8CubzJISmlBJPsQ51F5zua2zpkRXmTaS2xuYqrZLOfI2aW5SBMp5s9ycXlFDnFS6pM8ytSmqvNGOMeR6iBpGbjK3MrFGkae9UvadlQ02pVr1E1FUqvLulnO6Z7NLg/X7a4pQt7etRqqeI1ObLS8njsb17E9IjWv7/AFSpH/c01Rp5XeW8vyS+p1WtYqSzFJM8+fq6e/gxxuMuTl8eFNSpWcJTuqVe4UcyXJy7nU7e6cqVNyksuCyvJ4POnZVIvoQdOpFe6mmuhykk6e3KTOR7f2heZVd3EfBa8zVlqt7Sk1cWFxFL8VNqa/ZievWXiQp17iFKpNNxhVfJJ464TwVi8Fx91yvj6l4PF2prG06kai/vRTPASz0Nj9otSM+KK04STU6FJ5Xpj9jV3UlFnuw/rHxeea5Km4PyZW2sidXm6NoqqS6GnJOrSjNbowK1rOk+em2Zintsx5915M2StY2xRa6g4+5WW3mZc/CrxzFpmJVto1FzR2ZjclWjL3W/kZ3Z21qXp6VFypSw+nmZMkpw2PHV3UW09zIoX3L1NTOM3CrJSdKXLLoHut5RdJ0bqOE1zGJO3rUW3Fc0fgW1JE68FUjt1RC2qum+WazDy8hRqdmmvUk4pvKJ37jXXqs6NRShinFt/hXmfRnDmnR0nQrCwj1oUYqfxk95P6tnFPZrpH9r8TW0akOa3tn49XPRqPRfOWDvnqZ5L9Ncc+zAQzm6gaEMBoZEaAYxABIBDIGAgA8oeSORmkSyMiGQJALIwGAgIGAhgBCrTValOlLpUi4P5rH7kxZxuUfK97SdGtKjJYlSnKDXo8FLecI2Dj+wlp3F2p0XHEZV3Vh8Yz95fqa7nclF8XhDbK1LCDmLtNJ5ERyGRs0s5n5ibI5Bb9waNNlsZvuVpEk0IlWKRfT3XQxlJIsp1WtlsjcrNjJGnuUc+e5bQjKvWp0YfeqSUV6t4NbSTdfQPsq077DwbaTksTunKu/RvC/JI3JJHnabQVnYW1tTaUKNOMEvglgzYya6s8Vu7t9Px1NJyimY9Wkm+hepJkZ4wyLjbHl3FNLOxz3juhSvtboW9SMZxoWyeGs4c5P9oo6RcrJyTXdRi+NtWhKXuwjSpxy/5Y7/AKs58t1i9fFd3259Upujf3lF5/h1pRSfZZ2JOKZ72v2Durz7RYwpNSh/ExJRbll7vz7HkKyu28KlH/Gj18XPh4TdfJ+R8bk/JdRhzprsOlOpTjGpGxhWjGPPU8XOMPp0xjbuZdSyuYJOdJY/6iqTqcipeCppPmjzQjLlb8m1+XQ3+bj+q5z4/JO4pnLepTo2EHKpLMFUbbppRTccbZfvd+yK511UqwqfZIQSg3OlGTUHh8uU+uM7vfszJcLr+I3CUnVeanM1LnfXLznL+IlSvp1o1Vz+JFJRm5PKSWEs+WNsGbzYf8m/wZ/8WLVc4UuWVvGlODS5o9JZ7PdrPoUqr5oz61jqNZJNZSbcY5wk31wuiLrbhTVrqPNijTX/AOSb/wBCf5HH9U/xeS/7XkycJdUiqVOPY9nVuF77S9One1q9CcYSSlGGc7vGdzwISbe5ZnMumLx5YXVWJOLymZVK5rRWG8r4jtaVOVWCqRym99zu3BnDfC99oNlfQ0SzlWcOWq5xc/fjs/vN+vzNz17Y15OI29G41CfJbWdWvU/lpU3J/ke1YcD8S3laNOnpFzST/HXh4cY+rZ9C29Cja0/CtaNOhTX4KUFBfRFhfyE42t8DcLU+F9MlSlONW7rNSr1YrbbpFfBb+rZsgAc7d3bcmpoDEMKAAAGhoQ0AwAAGAhgAxAQeSPJEZtEgENEDHkiMBjIjAYIAAYABBp/H3BNHimhCtQqRoajRjywqSXuzj/LL9n2OR3/AfE9lOUZ6PcVYr8dBKpF/Q+jBYKPlm60+8s21d2lxQa/5tKUf1RjrfpufV8lzx5Z+9HylujyL7hXQNQbd5o9lUk/xKkoy+scE1B8zp4HzLyO8Xvsq4ZuMujC7tW/+VX5l9JJniXXsatnn7JrVaPkq1upfmmhocibFk6Pdex3WYZdrqFhWXbmc4P8ARmm6/wANapoF99iv6UHWdNVUqM1PMW8Z2+IqvK5/iHMyLUo4TjJN9E09xJmdmlim8lsXkx0yakalSxlRex7vBNBXXE+nxkouMKniNPvy7/6GuRkbTwJKFO9r15KPNGMYQb7Nvd/l+ZbfTXDjvkj6EpXE5Qi/d3insy+Nfbdo57U4ohZ20Fd3dvTxFL+JUSf65Nbv/anSoz5LRuss7yUHhfU4eL6GVxnddpVaPmiSqxfc49pPtStpXEKd1UioSX35QcVF/E3Sx4u0y8SVG6ozk+0KkZfox41J43qtqnFTku58xcRa/GfEOo1reEaqnc1GqjbSkuZ9jvmsa9Cy0LUL3mS8C2nKO+Pew8fm0fL/ACylLfdvqTwl7c+XPLD1HpS127l9ynSj/dLKHEWpUmsuMorty4MOlbpL4lngm/wY2dPP/kZy9vfpcTWtWKjdeJB98wz+hn22oaXVa/2ik/V4NQdBPqJ20P5UcsviS9O2Pzcp26Iq2kKCcrmgljvNFdbXOH7WGPtcJvuqacv0OeTt4xjzYWzJeAvIxPhz7rd+ffqNxjxTpHj83iVFHrvRbM6HHmlQxCNG5a/mVNJfqc/dBeQ40fg36I3PiYsX53I2HiniiWsUvstpSlStm05ub96eOnojXKdPfJcqbf4X82WxpNeR6cOPxmo8nJy3O7q2isOLOzex+vWlp1/RnCfgxqxnTm1s2000n8kcftEoV6be6Uk9z6hhjw44SSwsJbJHTP1NMYdgAA5ugAAAAAAGAAADENAMYgAYAAAMQAeRkeSOR5NIkPJHIZAnkCOR5AkAsjAaGRGQMYhgAxAQNDEADFkBMB5Pnr2r38r3ji9lTk8WqhQg0+nKt/zbPoPmUVzS6Ld+h8u6zcu91O7upPLrV5zz6ti9LHnVKtaclOdWcpJYTcm2kQcpt5cm2ibQYMaXZVKk6jzLGfNRSEptdck+UfJkaNlGtjuFWfNGLT+jJqjF9RSox7bF1dJubUrmnPMm228tvuZcIxx0IU4KJati4zRanGnB9iMaMVXxjG2U1sOGW9iU5KNak/jym/TG6yq1zdVqKoVrq4qUV0hKrJx+mSiNGC3SLZREtjWk8qEkgY2IrIDADAWE1iSyn2ZFUY4STljy5izHkCZdIUaUIvKX13J9hEkInZJD7ANfEppKl95M+mtMrq50yzrrpVoU5fWKPmal1XqfQnA1f7Rwlpc28tUeR/3W1+xjPpvj7e6AgObqYAAAAAAwEMAGIAGAhgMZEYDAAA8RMlkrTJJm0TyPJAaZBLJIhkaYE0xkUNASGRGgJIBDIGAAQMAQIAwJkhMDz9fuVZ6FqNy3jwrapL58rPmGfU+gfajeKz4LvVnErhwox+OXl/kmfPkt2W9ERwGCQGdKSJIQwJroIYJGmQlsSUckoomi6TYikkCpqpUba92Cx8+4OXLFyfSKyZNGk4W6i8qT3b+Je2d69ox3in8BNCptNNeTJmohdiLW5PHkDRURGkDYgGIMMAH2HFkRxe4E0SXQgSyUSj1O4eyi48bhGnDOXRuKkPrh/ucPidY9i11zWOp2rf3KkKiXqmn+iJn/AFXHt0kAA4uxgIAGgAAAYgAYAAAAAAwEMBgIYHgJkkytMkmbZWJjTIJjTAmiRBEkwJoZHI0yKkiRBEkBJDIokADEBBIEIZAwAAOX+3G75bDTLNS3nVnVlH4JJL9WcefU372yXjuOK3Qz7ttQhBL4v3n+qNAW7Ll2QwAERQPuA10AZJCGmVmpolkgmSj7zwVk0uepTh2zzS9F0/M9FNOOOiMOxSnKVR/ifu+iM3kXVv5G8Wcv0xXT5Krw1iS2HgheVc16apYxB5k+3oWY226CX6LLJLQLBLAmVksAMQCYmSZELAEQBBUyS2IoZUTXRHQPYzXcNfvaGdqtq384yX+rOfZ3N09kjceMIJPaVtVT+iF6J27aMQzg7gAAAGIAGAAADEMAAAAAAAGAhga6mSTKkycWdGVqGiCZNEEkSRAkgJoaIJkkBJEkyCZJEVNDRFDQEgAAAkRGQPICBNJ5fRbsQfOPtBuXc8YatUzlfaZRXpHb9jXUZus13c6pd128+JXnP6ybMOJMuydH2EMQUyREkggGIAVLIqk+SlJ937qBsoupbxiuyyxbqJJuvSs34cU8e6tlhrZ/ELq7mklSfvY6+XmS4dt6mqXKsaE4xuZxl4fiSxGTSyor4vp6nmpzhWcK2YzTxNT2afdbi5+tRrHD3urIr3HFuan8Vs/mehaz8S3hL4YfqjFddRW0lv13W5OxqJqpBNbPmxkcd1WuXH+LJbED6iyd3lAIQ0QDEHcOoWEwQMaCpdgFkG8sImuhu3siWeLl8Laq/wBDSYs3D2UV1R4yt4t7VaVSn9VlfoL0Tt3FjQho4u5iBiAkAkwAYxAAxiABgIYAAAAAAAa0iSZWiaOjC1MkmVpk0wqaGiKZIgkSRBEkBMaIjQE0SRBMkiKkCECYEgEhgBj6jUdKwuqi6wozl9IsyDB12fh6JqNR/htar/7WWdpenzBN5eX1CK2FLrj4DRz+1MTQZGUIaExgMGAmENbvfojFk+ebk+7L6r5ab85FEd2Zyai2356dRVKcuWUejwevR4ivKNbxHTt5zezlKGW/rk8ynFqOUQn96O3caXbZv/XN9CPLK0tH/wDpp/8AxMG+4kr6rOjTuKNCnCMm06cUnusdkjwaialuLOGsdib1Vvuae3LqIhTn4lOE13W5I9LzGCENBAwQMQU2IYgpsEPGwYCJJnt8E3H2bivTKjeMXEF9Xg8PJk6bVdC/t60XvCpGS+TyUj6bxh4GQjNVEprpJcy+e5M4O5AwEwAYgCGMiMBjFkApgAgGMiMBgLIwNXTJorTJo6sJomitEkyC1MkitE0wqaGiKJIgkmNEUSQEkSIJkgJZAiNEVIZHIwGeTxdNw4W1eS2xZ1P8p6pr3tCr+BwXq0s7yo8i+ckiztK+dZ/eDsE/vAuhzUACGUIEMQEgW7EQrT5Y8q6vqNmldWXPJ+XYKazIgi+lHG5jutdLktiuoveh6l0d18SNRZlDK35jdjKi4g08spZm3FPKWMmHNYeDFjUZmn1NnTfqjMZ5FObpzjOPVHqwmpxUo9HudePLc05ZzV2khiwM6MAMdxD7AgEwbAKlkMrAl0Ht2CQi63/3ifluVNE6LSlv0xgsH0polxG70ewuIPKqW9OX/ajONY9mt19p4OsU3l0XOi/lJ4/Jo2dnG9u06DIjERaAAAgGIAJAIYDAQwAAAAGIANXRNFaJJnVlYmSTIIkiCxMkitE0wLESRWmSQVNEkQRIgkSTIIYEwIjAkMiBBLJq3tNr21HgrUFdSx4ijCkk95T5k1+jfyNoObe3BP8AsTTZJvCuZJrs/dA5BPHVdCPYi20kvgR8THWJz21pYiRT4scknUj5l3DSwCvxI+YnVXZDcTSxyUVl/Ix5NyeWEm5PccYtmbdtSaEI5ZlR2WCFNYRckmtywp9NyMt5w2/EGHESfvw/6jSMqpHMFsupgXFJptnop5is+ZXWp8xbNpHlMybO48N8k/uvo/IhUotFLWDnLZWrNx7Wc9wyeXQuZ09nvH9DLjd05fix6naZyuVwsZAyuNWEukl9RupFdZL6mtxjVSDOxU7ikvxx+TIfaIv7qk/RE8o141kphkxvFqfhp/VkoKrP8UY+iHlF8KuzsOMsPHmUOjPOJSk8/EupUOR5QmVLg7R7Hb23qaBXs41H9ppV5VJ032jJJJrzW31N+Pn7ga+uLPijTnaNudStGlOC/HCTw0/lv8j6AM5d7anQABGVMQAAwEADGIAGMQICQCGAAAAaoiaIIkmdWFiJIgmSQVNE0VokmQWIkmQRJBU0SRBMkmQSRJERoBjEAEhkRgM5/wC2qnz8NWcv5bxfnFm/mi+2XbhOk+/2uGP8MgOHz3bIYyTGkcW1fIHhotwMaFXhInGkiS6li2RdCrwkSjFImGzGgKOxJYRHOBORUTcljDK0/wCJD1E3kjF+/H1G1Z0JvCySTXX8iiL23LE0a2huClEoqW8TIz7qFu2LNjC+z7idsZrWNiLSM+MXbE+yrzJK2iviZOBZyPGG1caUY9EXQSW2NiDY8lgt2XQSeHsRT2Fk0jKp1Iv72AqTWMxZjpk6SX3pb/Au2XTfYxo0K1zd6zWim6GKNFNdJSWZS+mF82dZNe9n9rG14O0xKChKrS8aeFjLk28v5YNhM5X2oEAECABAMZEYDGJDAAAAGMQASAQAapkkiBJM7MJomitE0QTRJEESTCrESRWiaIJokiCJJhU0NEUSRAxiABjEADRz7211GuHLKHaV3l/KDOgo0X2xWvj8KQrLrb3MZfJpofR9uIdyaK11LEcXSmGAwPsVAiZXkOYomyLFkWSbEs56iEACZFPEl6jkC7EFsZbIlzMilFJPmXoiaXkagmm9tyeUQiNvGxpEmyLxgjnIsgS7jUStPdFiewCcRrqN7i7ASwLuNMiUDzkvo++4w7t4KcFtu3GrCS2cWpL5BH0hwrNT4b0xx6K3jFfLb9j1DyuFafg8NaXDOX9lg381n9z1DIYgABAAAAAADGhDAYCABjEAEgEAGqIYAdnNJE0AASRJABGk0SQAQSRJAAEkSTAApgAEDGAACNb9o8Iz4J1TmWeWnGS+DUkAAfPXcmmAHF0SBgBUGHgiAAAAAAMAAgxT2iAEDhLYthIALBYpDbADSD9BAAC7lsd8gAgbeOgs5AChpbgwAAjsX0er+EX+gAFfRvDE1U4b0qcXs7Ol/lSPUABWSAAIAAAAAAABgADAAABgAAMAA//Z';

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const C = {
  label: '#1D1D1F',
  secondary: '#6E6E73',
  tertiary: '#86868B',
  light: '#F5F5F7',
  separator: '#D2D2D7',
  tint: '#1E8A5A',
  tintOnDark: '#30D158',
};

// ── Content ──────────────────────────────────────────────────

const steps = [
  { title: 'Collect', text: 'Trained youth teams pick up organic waste from homes, markets and businesses.' },
  { title: 'Track', text: 'Smart bins report how full they are, so no bin is left to overflow.' },
  { title: 'Process', text: 'Black Soldier Fly larvae, composting and biogas break the waste down.' },
  { title: 'Supply', text: 'Feed goes to poultry and fish farmers, fertiliser to growers.' },
  { title: 'Reinvest', text: 'Income pays for more bins, more jobs and more neighbourhoods.' },
];

const perTonne = [
  { value: '180', unit: 'kg', label: 'protein feed for poultry and fish' },
  { value: '250', unit: 'kg', label: 'organic fertiliser for farms' },
  { value: '60', unit: 'm³', label: 'biogas for clean energy' },
];

const platformFeatures = [
  { icon: Radio, title: 'Smart bins', text: 'Sensors raise an alert before a bin overflows.' },
  { icon: Route, title: 'Smarter routes', text: 'Live data plans the shortest collection path. Built with Dev Tek Innovation.' },
  { icon: Smartphone, title: 'A field app for every collector', text: 'Zones, check-ins and photo proof of every pickup.' },
];

const outcomes = [
  { icon: HeartPulse, title: 'Healthier neighbourhoods', text: 'Fewer breeding sites for flies and mosquitoes, and less contaminated water.' },
  { icon: Users, title: 'Jobs for young people', text: 'Paid work as collectors, operators and micro-franchise owners.' },
  { icon: Sprout, title: 'Cheaper inputs for farmers', text: 'Local feed and fertiliser instead of costly imports.' },
  { icon: Wind, title: 'Less methane', text: 'Organic waste kept out of open dumps, where it would rot.' },
];

// ── Page ─────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased" style={{ fontFamily: SYSTEM_FONT, color: C.label }}>
      <Nav />
      <Hero />

      {/* 2. The problem */}
      <Section tone="light" id="problem">
        <Intro
          title="Uncollected waste is a health problem first."
          text="Most of Dar es Salaam's waste is organic, and most of it is never collected. In drains and open dumps it breeds flies and mosquitoes, fouls water and releases methane."
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            { v: '~4,600 t', t: 'of solid waste produced in the city every day' },
            { v: '>60%', t: 'of it is organic, and could become feed, fertiliser or energy' },
            { v: '<50%', t: 'is formally collected; the rest is left in the open' },
          ].map((s) => (
            <div key={s.v}>
              <p className="text-[56px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{s.v}</p>
              <p className="mt-3 text-[17px] leading-[1.45] max-w-[260px] mx-auto text-balance" style={{ color: C.secondary }}>{s.t}</p>
            </div>
          ))}
        </div>
        <Footnote>Approximate figures from published waste studies of Dar es Salaam, to be refined with pilot data.</Footnote>
      </Section>

      {/* 3. How it works */}
      <Section id="how">
        <Intro title={"From street\u00A0to\u00A0soil, in one loop."} text="Every step creates value, and every step is tracked live on KijaniSense." />
        <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-[24px] p-6" style={{ background: C.light }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold text-white" style={{ background: C.tint }}>
                {i + 1}
              </span>
              <p className="mt-5 text-[19px] font-semibold">{s.title}</p>
              <p className="mt-1.5 text-[15px] leading-[1.45]" style={{ color: C.secondary }}>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-[28px] p-8 md:p-10" style={{ background: C.light }}>
          <p className="text-[21px] font-semibold text-center">What one tonne of organic waste becomes</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {perTonne.map((o) => (
              <div key={o.label}>
                <p className="flex items-baseline justify-center gap-1.5">
                  <span className="text-[56px] leading-none font-semibold tracking-[-0.03em] tabular-nums" style={{ color: C.tint }}>{o.value}</span>
                  <span className="text-[21px] font-semibold" style={{ color: C.secondary }}>{o.unit}</span>
                </p>
                <p className="mt-2 text-[17px] text-balance" style={{ color: C.secondary }}>{o.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Footnote>Typical Black Soldier Fly conversion rates. Real yields depend on the waste mix and will be confirmed in the pilot.</Footnote>
      </Section>

      {/* 4. KijaniSense — dark */}
      <section id="platform" className="scroll-mt-12 bg-black text-white py-24 md:py-32 px-6">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[760px] mx-auto">
            <p className="text-[21px] font-semibold" style={{ color: C.tintOnDark }}>KijaniSense</p>
            <h2 className="mt-2 text-[40px] md:text-[56px] leading-[1.07] font-semibold tracking-[-0.02em] text-balance">
              Every bin, unit and station. Live.
            </h2>
            <p className="mt-5 text-[19px] md:text-[21px] leading-[1.4] text-[#A1A1A6] text-balance">
              Our own platform shows councils, partners and our teams exactly what is happening, street by street.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformFeatures.map((f) => (
              <div key={f.title} className="rounded-[28px] p-8 bg-[#1D1D1F]">
                <f.icon size={28} strokeWidth={1.75} style={{ color: C.tintOnDark }} />
                <p className="mt-6 text-[21px] font-semibold tracking-[-0.01em]">{f.title}</p>
                <p className="mt-2 text-[17px] leading-[1.45] text-[#A1A1A6]">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-[19px]" style={{ color: C.tintOnDark }}>
              Open the live platform <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Why it matters, and who is behind it */}
      <Section tone="light" id="impact">
        <Intro title="Why it matters." text="One loop, four kinds of good." />
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {outcomes.map((o) => (
            <div key={o.title} className="bg-white rounded-[28px] p-7">
              <o.icon size={28} strokeWidth={1.75} style={{ color: C.tint }} />
              <p className="mt-5 text-[19px] font-semibold">{o.title}</p>
              <p className="mt-1.5 text-[15px] leading-[1.45]" style={{ color: C.secondary }}>{o.text}</p>
            </div>
          ))}
        </div>

        <div id="team" className="scroll-mt-16 mt-24">
          <Intro title="Who's behind it." text="A public-health mind and an engineering mind, building it together." />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-[28px] p-8">
              <img src={FOUNDER_PHOTO} alt="Timoth Jeremiah Mbaga" className="w-20 h-20 rounded-full object-cover object-top" />
              <p className="mt-6 text-[24px] font-semibold tracking-[-0.01em]">Timoth Jeremiah Mbaga</p>
              <p className="mt-1 text-[17px]" style={{ color: C.tint }}>Founder, health and business strategy</p>
              <p className="mt-4 text-[17px] leading-[1.5]" style={{ color: C.secondary }}>
                Pharmacy student at MUHAS and youth leader in public health, AMR advocacy and digital health.
              </p>
              <blockquote className="mt-6 text-[19px] leading-[1.45] font-medium">
                “Disease prevention doesn’t start in the hospital. It starts in the street, the market and the drain.”
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                <a href="mailto:mbagatimothy@gmail.com" className="inline-flex items-center gap-1.5" style={{ color: C.tint }}><Mail size={16} />mbagatimothy@gmail.com</a>
                <a href="tel:+255784598953" className="inline-flex items-center gap-1.5" style={{ color: C.tint }}><Phone size={16} />+255 784 598 953</a>
              </div>
            </div>
            <div className="bg-white rounded-[28px] p-8">
              <span className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-semibold text-white" style={{ background: C.label }}>DM</span>
              <p className="mt-6 text-[24px] font-semibold tracking-[-0.01em]">David Fredrick Mdikula</p>
              <p className="mt-1 text-[17px]" style={{ color: C.tint }}>Co-founder, IoT and systems engineering</p>
              <p className="mt-4 text-[17px] leading-[1.5]" style={{ color: C.secondary }}>
                Founder of Dev Tek Innovation. Leads the smart-bin hardware, route planning and field-app software behind KijaniSense.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. Get involved — one door per audience */}
      <Section id="join">
        <Intro title="There's a place for you in the loop." text="Choose where you fit, and we'll take it from there." />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Door
            icon={Landmark}
            title="Councils"
            text="Pilot KijaniSense in your ward and see live waste data for your area."
            action={{ label: 'Register your council', to: '/signup' }}
          />
          <Door
            icon={HandHeart}
            title="Volunteers and CSOs"
            text="Join clean-up drives and campaigns, and connect with others in the community forum."
            action={{ label: 'Join as a volunteer', to: '/signup' }}
          />
          <Door
            icon={Handshake}
            title="Partners and buyers"
            text="Fund the pilot, co-fund hygiene stations, or buy feed and fertiliser."
            action={{ label: 'Email us', href: 'mailto:kijanihubtz@gmail.com' }}
            secondary={{ label: 'See products and prices', to: '/login' }}
          />
        </div>
        <p className="mt-12 text-center text-[17px]" style={{ color: C.secondary }}>
          Prefer to talk? Reach us at{' '}
          <a href="mailto:kijanihubtz@gmail.com" style={{ color: C.tint }}>kijanihubtz@gmail.com</a> or{' '}
          <a href="tel:+255784598953" style={{ color: C.tint }}>+255 784 598 953</a>.
        </p>
      </Section>

      <Footer />
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────

function Nav() {
  const links = [
    { href: '#how', label: 'How it works' },
    { href: '#platform', label: 'KijaniSense' },
    { href: '#impact', label: 'Impact' },
    { href: '#team', label: 'Team' },
    { href: '#join', label: 'Get involved' },
  ];
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/75 backdrop-blur-xl backdrop-saturate-150" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
      <div className="max-w-[1080px] mx-auto h-12 px-6 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-[7px] flex items-center justify-center" style={{ background: C.tint }}>
            <Leaf size={14} className="text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.01em]">Kijani Hub</span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-[13px]">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="opacity-80 hover:opacity-100 transition-opacity">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] opacity-80 hover:opacity-100">Sign in</Link>
          <Link to="/signup" className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white" style={{ background: C.tint }}>
            Join
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  return (
    <header id="top" className="pt-20 md:pt-28 px-6 text-center overflow-hidden">
      <p className="inline-flex items-center gap-2 text-[17px] font-semibold" style={{ color: C.tint }}>
        <span className="w-2 h-2 rounded-full" style={{ background: C.tint }} />
        Now piloting in Dar es Salaam
      </p>
      <h1 className="mt-3 text-[56px] sm:text-[72px] lg:text-[96px] leading-[1.02] font-bold tracking-[-0.035em]">
        Waste in.
        <br />
        Value out.
      </h1>
      <p className="mt-6 text-[19px] md:text-[24px] leading-[1.35] max-w-[760px] mx-auto text-balance" style={{ color: C.secondary }}>
        Kijani Hub turns organic waste into feed, fertiliser and clean energy, for cleaner streets, healthier neighbourhoods and jobs for young people.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <a href="#join" className="rounded-full px-6 py-3 text-[17px] font-medium text-white" style={{ background: C.tint }}>
          Get involved
        </a>
        <a href="#how" className="inline-flex items-center gap-1 text-[17px]" style={{ color: C.tint }}>
          See how it works <ChevronRight size={18} />
        </a>
      </div>

      {/* The one orchestrated moment: the phone rises into view on load */}
      <motion.div
        className="mt-16 md:mt-20 mx-auto h-[500px] md:h-[560px]"
        style={{ clipPath: 'inset(-200px -200px 0 -200px)' }}
        initial={reduce ? false : { opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <PhoneMock />
      </motion.div>
    </header>
  );
}

/** An iPhone drawn in code, showing the KijaniSense Overview */
function PhoneMock() {
  const bars = [0.55, 0.64, 0.7, 0.66, 0.75, 0.8, 0.9];
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto w-[300px] h-[620px] rounded-[54px] p-[11px] bg-[#1D1D1F]" style={{ boxShadow: '0 0 0 2px #3A3A3C, 0 40px 80px rgba(0,0,0,0.18)' }} aria-label="KijaniSense on iPhone" role="img">
      <div className="relative h-full rounded-[44px] overflow-hidden text-left" style={{ background: '#F2F2F7' }}>
        <div className="flex items-center justify-between px-7 pt-3.5 text-[13px] font-semibold">
          <span>9:41</span>
          <span className="w-[88px] h-[26px] rounded-full bg-black" />
          <span className="w-4 h-2.5 rounded-[3px] border border-current opacity-80" />
        </div>
        <div className="px-4 pt-5">
          <p className="text-[26px] font-bold tracking-[-0.02em]">Overview</p>
          <p className="text-[12px]" style={{ color: C.secondary }}>Live from 8 devices</p>

          <p className="mt-4 mb-1.5 px-1 text-[14px] font-semibold">Needs attention</p>
          <div className="bg-white rounded-xl">
            {[['Ilala District Bin', '92% full'], ['School WASH Station', 'Soap 15%']].map(([n, d], i) => (
              <div key={n}>
                {i > 0 && <div className="ml-8 h-px bg-[#E5E5EA]" />}
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                  <div className="flex-1">
                    <p className="text-[12px] font-medium">{n}</p>
                    <p className="text-[10px]" style={{ color: C.secondary }}>{d}</p>
                  </div>
                  <ChevronRight size={13} color="#C4C4C7" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            <div className="col-span-3 bg-white rounded-xl p-2.5">
              <p className="text-[10px] font-semibold flex items-center gap-1" style={{ color: C.tint }}><Trash2 size={10} />Waste</p>
              <p className="text-[18px] font-semibold tabular-nums leading-tight">4,450<span className="text-[10px] ml-0.5" style={{ color: C.secondary }}>kg</span></p>
              <div className="mt-1.5 h-[46px] flex items-end gap-[3px]">
                {bars.map((b, i) => (
                  <span key={i} className="flex-1 rounded-[3px]" style={{ height: `${b * 100}%`, background: i === 6 ? C.tint : 'rgba(30,138,90,0.35)' }} />
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-white rounded-xl p-2.5 flex flex-col items-center justify-center">
              <svg width="64" height="64" className="-rotate-90" aria-hidden="true">
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(30,138,90,0.15)" strokeWidth="8" />
                <circle cx="32" cy="32" r={r} fill="none" stroke={C.tint} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * 0.25} />
              </svg>
              <p className="mt-1 text-[11px] font-semibold tabular-nums">6/8 online</p>
            </div>
          </div>

          <div className="mt-3 bg-white rounded-xl grid grid-cols-2">
            <div className="p-2.5 border-r border-[#E5E5EA]">
              <p className="text-[10px] font-semibold" style={{ color: '#9A7A55' }}>Frass</p>
              <p className="text-[16px] font-semibold tabular-nums">1,113<span className="text-[10px] ml-0.5" style={{ color: C.secondary }}>kg</span></p>
            </div>
            <div className="p-2.5">
              <p className="text-[10px] font-semibold" style={{ color: '#0E9AAD' }}>CO₂ avoided</p>
              <p className="text-[16px] font-semibold tabular-nums">8,411<span className="text-[10px] ml-0.5" style={{ color: C.secondary }}>kg</span></p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 border-t border-black/10 bg-[#F9F9F9]/90 backdrop-blur-xl pb-5 pt-1.5 grid grid-cols-5 text-[9px] font-medium text-center">
          {[
            { I: LayoutDashboard, l: 'Overview', on: true },
            { I: Trash2, l: 'Collection' },
            { I: MapIcon, l: 'Map' },
            { I: MessagesSquare, l: 'Community' },
            { I: MoreHorizontal, l: 'More' },
          ].map(({ I, l, on }) => (
            <span key={l} className="flex flex-col items-center gap-0.5" style={{ color: on ? C.tint : '#8E8E93' }}>
              <I size={17} strokeWidth={on ? 2.25 : 1.9} />{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type DoorAction = { label: string; to?: string; href?: string };

function DoorLink({ action, primary }: { action: DoorAction; primary?: boolean }) {
  const cls = primary
    ? 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-medium text-white'
    : 'inline-flex items-center gap-1 text-[15px]';
  const style = primary ? { background: C.tint } : { color: C.tint };
  const content = <>{action.label}{!primary && <ChevronRight size={16} />}</>;
  return action.to
    ? <Link to={action.to} className={cls} style={style}>{content}</Link>
    : <a href={action.href} className={cls} style={style}>{content}</a>;
}

function Door({
  icon: Icon, title, text, action, secondary,
}: { icon: typeof Landmark; title: string; text: string; action: DoorAction; secondary?: DoorAction }) {
  return (
    <div className="rounded-[28px] p-8 flex flex-col" style={{ background: C.light }}>
      <Icon size={30} strokeWidth={1.75} style={{ color: C.tint }} />
      <p className="mt-6 text-[24px] font-semibold tracking-[-0.01em]">{title}</p>
      <p className="mt-2 text-[17px] leading-[1.45] flex-1" style={{ color: C.secondary }}>{text}</p>
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <DoorLink action={action} primary />
        {secondary && <DoorLink action={secondary} />}
      </div>
    </div>
  );
}

function Section({ id, tone, children }: { id?: string; tone?: 'light'; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-12 py-24 md:py-32 px-6" style={{ background: tone === 'light' ? C.light : '#FFFFFF' }}>
      <div className="max-w-[1080px] mx-auto">{children}</div>
    </section>
  );
}

function Intro({ title, text }: { title: string; text?: string }) {
  return (
    <div className="text-center max-w-[780px] mx-auto">
      <h2 className="text-[40px] md:text-[56px] leading-[1.07] font-semibold tracking-[-0.02em] text-balance">{title}</h2>
      {text && <p className="mt-5 text-[19px] md:text-[21px] leading-[1.4] text-balance" style={{ color: C.secondary }}>{text}</p>}
    </div>
  );
}

function Footnote({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 text-center text-[13px] max-w-[640px] mx-auto text-balance" style={{ color: C.tertiary }}>{children}</p>;
}

function Footer() {
  return (
    <footer className="px-6 py-10 text-[12px]" style={{ background: C.light, color: C.secondary, borderTop: `1px solid ${C.separator}` }}>
      <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p>Kijani Hub, Dar es Salaam, Tanzania. Powered by KijaniSense, built with Dev Tek Innovation.</p>
        <div className="flex gap-5">
          <Link to="/login" className="hover:underline">Sign in</Link>
          <Link to="/signup" className="hover:underline">Join the network</Link>
          <a href="mailto:kijanihubtz@gmail.com" className="hover:underline">Contact</a>
        </div>
      </div>
      <p className="max-w-[1080px] mx-auto mt-3" style={{ color: C.tertiary }}>© 2026 Kijani Hub. All rights reserved.</p>
    </footer>
  );
}
