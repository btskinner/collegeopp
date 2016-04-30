#################################################################################
##
## <PROJ> Measuring college opportunity
## <FILE> makedata.R
## <AUTH> Benjamin Skinner
## <INIT> 15 April 2016
##
################################################################################

## clear memory
rm(list = ls())

## libraries
libs <- c('dplyr','geosphere','readr','tidyr')
lapply(libs, require, character.only = TRUE)

## options
options(scipen = 999)

## directories
ddir <- '../data/'

## quick functions
`%+%` <- function(a,b) paste0(a,b)

## vars
stfipslist <- c(1,4:6,8:13,16:42,44:51,53:56)

## ===================================================================
## COMPUTE DISTANCES
## ===================================================================

## read in institutional data
inst <- read_csv(ddir %+% 'hd2014.csv') %>%
    setNames(tolower(names(.))) %>%
    select(unitid, lon = longitud, lat = latitude, fips, countycd, sector) %>%
    rename(stfips = fips,
           fips = countycd) %>%
    filter(sector %in% c(1:6),
           stfips %in% stfipslist) %>%
    mutate(public = as.integer(sector %in% c(1,4)),
           privnp = as.integer(sector %in% c(2,5)),
           privfp = as.integer(sector %in% c(3,6)),
           twoyr  = as.integer(sector %in% c(4:6))) %>%
    arrange(unitid)

## read in student lon/lat from arguments
coun <- read_csv(ddir %+% 'county_centers.csv') %>%
    select(fips, lon = pclon10, lat = pclat10) %>%
    mutate(fips = as.integer(fips),
           lon = ifelse(fips == 51560, lon[fips == 51005], lon),
           lat = ifelse(fips == 51560, lat[fips == 51005], lat)) %>%
    filter(floor(fips / 1000) %in% stfipslist) %>%
    arrange(fips)

## get vectors of names
unitid <- inst %>% select(unitid) %>% .[['unitid']]
fips <- coun %>% select(fips) %>% .[['fips']]

## matrices of lon/lat
colmat <- data.matrix(inst %>% select(lon, lat))
conmat <- data.matrix(coun %>% select(lon, lat))

## compute distances
distmat <- distm(conmat, colmat)

## add row and column names
rownames(distmat) <- fips
colnames(distmat) <- unitid

## --------------------------------------
## INSTATE MASK
## --------------------------------------

m1 <- inst %>%
    .[['stfips']] %>%
    replicate(nrow(distmat), .) %>%
    t(.)

m2 <- coun %>%
    mutate(stfips = floor(fips / 1000)) %>%
    .[['stfips']] %>%
    replicate(ncol(distmat), .)

stmask <- (m1 == m2) + 0

## --------------------------------------
## INVERSE LOG DISTANCE
## --------------------------------------

## unrestricted
d <- rowSums(log(distmat)^-1)

## public two-year
mask <- inst %>%
    mutate(pubtwo = ifelse(public == 1 & twoyr == 1, 1, Inf)) %>%
    select(pubtwo) %>%
    .[['pubtwo']] %>%
    replicate(nrow(distmat), .) %>%
    t(.)
mask <- ifelse(is.infinite(mask), 0, mask)
dp2 <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)
mask <- mask * stmask
dp2s <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)

## two-year
mask <- inst %>%
    mutate(twoyr2 = ifelse(twoyr == 1, 1, Inf)) %>%
    select(twoyr2) %>%
    .[['twoyr2']] %>%
    replicate(nrow(distmat), .) %>%
    t(.)
mask <- ifelse(is.infinite(mask), 0, mask)
d2 <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)
mask <- mask * stmask
d2s <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)

## public four-year
mask <- inst %>%
    mutate(pubfour = ifelse(public == 1 & twoyr == 0, 1, Inf)) %>%
    select(pubfour) %>%
    .[['pubfour']] %>%
    replicate(nrow(distmat), .) %>%
    t(.)
mask <- ifelse(is.infinite(mask), 0, mask)
dp4 <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)
mask <- mask * stmask
dp4s <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)

## four-year
mask <- inst %>%
    mutate(fouryr = ifelse(twoyr == 0, 1, Inf)) %>%
    select(fouryr) %>%
    .[['fouryr']] %>%
    replicate(nrow(distmat), .) %>%
    t(.)
mask <- ifelse(is.infinite(mask), 0, mask)
d4 <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)
mask <- mask * stmask
d4s <- rowSums(log(distmat * mask)^-1, na.rm = TRUE)

## bind inverse log distances into one dataframe; standardize
ild <- bind_cols(data.frame(fips),
                 data.frame(d),
                 data.frame(dp2),
                 data.frame(dp2s),
                 data.frame(d2),
                 data.frame(d2s),
                 data.frame(dp4),
                 data.frame(dp4s),
                 data.frame(d4),
                 data.frame(d4s)) %>%
    mutate_each(funs(round((. - mean(.)) / sd(.), 3)), -fips) %>%
    mutate_each(funs(cut(., breaks = quantile(., seq(0,1,.1)),
                         include.lowest = TRUE,
                         labels=seq(0,9,1),
                         right = FALSE)),
                -fips)

## --------------------------------------
## COUNTS
## --------------------------------------

counts <- inst %>%
    group_by(fips, sector) %>%
    summarise(n = n()) %>%
    ungroup() %>%
    mutate(sector = 's' %+% sector) %>%
    spread(sector, n, fill = 0) %>%
    mutate(sn = s1 + s2 + s3 + s4 + s5 + s6)

## --------------------------------------
## JOIN/SAVE
## --------------------------------------

df <- ild %>%
    left_join(counts, by = 'fips') %>%
    select(id = fips, sn, s1, s2, s3, s4, s5, s6,
           d, dp2, dp2s, d2, d2s, dp4, dp4s, d4, d4s)

df[is.na(df)] <- 0

## save
write.table(df, file = ddir %+% 'mapdata.tsv', row.names = FALSE,
            quote = FALSE, sep = '\t')

## =============================================================================
## END FILE
################################################################################
